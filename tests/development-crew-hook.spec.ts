import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import developmentCrewHook, {
  extractAndStripFrontmatter,
  getBootstrapContent,
  isBootstrapInjected,
  __resetBootstrapCache,
} from '../hooks/development-crew.ts';

describe('extractAndStripFrontmatter', () => {
  it('returns body only when frontmatter is present', () => {
    const raw = '---\nname: test-skill\ndescription: A test skill\n---\n\n# Body text\n\nSome content.';
    const result = extractAndStripFrontmatter(raw);

    expect(result.frontmatter.name).toBe('test-skill');
    expect(result.frontmatter.description).toBe('A test skill');
    expect(result.content).toBe('\n# Body text\n\nSome content.');
  });

  it('returns original content when no frontmatter fence', () => {
    const raw = '# No frontmatter\n\nJust body.';
    const result = extractAndStripFrontmatter(raw);

    expect(result.frontmatter).toEqual({});
    expect(result.content).toBe(raw);
  });

  it('handles frontmatter with quoted values', () => {
    const raw = '---\nname: "quoted-name"\n---\nBody here.';
    const result = extractAndStripFrontmatter(raw);

    expect(result.frontmatter.name).toBe('quoted-name');
    expect(result.content).toBe('Body here.');
  });

  it('handles frontmatter with single-quoted values', () => {
    const raw = "---\nname: 'single-quoted'\n---\nBody here.";
    const result = extractAndStripFrontmatter(raw);

    expect(result.frontmatter.name).toBe('single-quoted');
    expect(result.content).toBe('Body here.');
  });
});

describe('getBootstrapContent', () => {
  it('caches content after first read', () => {
    const spy = vi.spyOn(fs, 'readFileSync');

    const first = getBootstrapContent();
    const second = getBootstrapContent();

    expect(first).toBe(second);
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});

describe('isBootstrapInjected', () => {
  it('returns false for empty branch', () => {
    expect(isBootstrapInjected([])).toBe(false);
  });

  it('returns false when no bootstrap entry exists', () => {
    const branch = [
      { type: 'user', customType: undefined },
      { type: 'custom', customType: 'some-other' },
    ];
    expect(isBootstrapInjected(branch)).toBe(false);
  });

  it('returns true when bootstrap entry exists', () => {
    const branch = [
      { type: 'user' },
      { type: 'custom', customType: 'development-crew-bootstrap' },
    ];
    expect(isBootstrapInjected(branch)).toBe(true);
  });
});

describe('DevelopmentCrewHook', () => {
  function mockHookAPI() {
    const handlers: Record<string, Array<(...args: any[]) => any>> = {};

    return {
      on: vi.fn((event: string, handler: (...args: any[]) => any) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
      }),
      sendMessage: vi.fn(),
      appendEntry: vi.fn(),
      _handlers: handlers,
      _emit: async (event: string, ...args: any[]) => {
        for (const handler of handlers[event] ?? []) {
          await handler(...args);
        }
      },
    };
  }

  function mockContext(branch: Array<{ type: string; customType?: string }> = []) {
    return {
      sessionManager: {
        getBranch: () => branch,
      },
    };
  }

  beforeEach(() => {
    vi.resetModules();
    __resetBootstrapCache();
    vi.restoreAllMocks();
  });

  it('registers a session_start handler', () => {
    const pi = mockHookAPI();
    developmentCrewHook(pi);

    expect(pi.on).toHaveBeenCalledTimes(1);
    expect(pi.on).toHaveBeenCalledWith('session_start', expect.any(Function));
  });

  it('injects bootstrap on empty branch', async () => {
    const pi = mockHookAPI();
    developmentCrewHook(pi);

    await pi._emit('session_start', {}, mockContext([]));

    expect(pi.sendMessage).toHaveBeenCalledTimes(1);
    expect(pi.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining('Development Crew'),
      { deliverAs: 'nextTurn' },
    );
    expect(pi.appendEntry).toHaveBeenCalledWith('development-crew-bootstrap', { injected: true });
  });

  it('does not inject when bootstrap already present (idempotency)', async () => {
    const pi = mockHookAPI();
    developmentCrewHook(pi);

    const branch = [{ type: 'custom', customType: 'development-crew-bootstrap' }];
    await pi._emit('session_start', {}, mockContext(branch));

    expect(pi.sendMessage).not.toHaveBeenCalled();
    expect(pi.appendEntry).not.toHaveBeenCalled();
  });

  it('does not inject when bootstrap file is missing', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const pi = mockHookAPI();
    developmentCrewHook(pi);

    await pi._emit('session_start', {}, mockContext([]));

    expect(pi.sendMessage).not.toHaveBeenCalled();
    expect(pi.appendEntry).not.toHaveBeenCalled();
  });

  it('includes the idempotency marker in sent message', async () => {
    const pi = mockHookAPI();
    developmentCrewHook(pi);

    await pi._emit('session_start', {}, mockContext([]));

    const sentText = pi.sendMessage.mock.calls[0][0];
    expect(sentText).toContain('<!-- development-crew-bootstrap -->');
  });
});
