import { describe, expect, it, vi } from 'vitest';
import plugin from '../index.js';
import { createDevelopmentCrewSetup } from '../lib/development-crew.js';

function mockContext() {
  return {
    options: {},
    plugin: { list: vi.fn(async () => ({ data: [{ id: 'development-crew', source: { type: 'local', path: '/checkout/index.js' } }] })) },
    skill: { transform: vi.fn(async (_callback: any) => {}) },
    session: { hook: vi.fn(async (_name: string, _callback: any) => {}) },
  };
}

async function getContextHook(load?: () => Promise<any[]>) {
  const ctx = mockContext();
  await createDevelopmentCrewSetup(load)(ctx);
  return ctx.session.hook.mock.calls[0][1];
}

describe('OpenCode v2 plugin', () => {
  it('exports a native definition with a stable ID and setup', () => {
    expect(plugin.id).toBe('development-crew');
    expect(typeof plugin.setup).toBe('function');
    expect(plugin).not.toHaveProperty('server');
  });

  it('registers all packaged skills with file paths and stripped bodies', async () => {
    const ctx = mockContext();
    await plugin.setup(ctx);
    const add = vi.fn();
    ctx.skill.transform.mock.calls[0][0]({ add });

    expect(add.mock.calls.map(([skill]) => skill.id).sort()).toEqual([
      'architect', 'code-reviewer', 'implementer', 'rubber-duck', 'shared-principles', 'using-development-crew',
    ]);
    for (const [skill] of add.mock.calls) {
      expect(skill.path).toMatch(/\/skills\/[^/]+\/SKILL\.md$/);
      expect(skill.description).toBeTruthy();
      expect(skill.content).not.toMatch(/^---\n/);
    }
    expect(ctx.session.hook).toHaveBeenCalledWith('context', expect.any(Function));
  });

  it('loads once and replays registration without leaking editor mutations', async () => {
    const load = vi.fn(async () => [{ id: 'test', name: 'test', content: 'Original' }]);
    const ctx = mockContext();
    await createDevelopmentCrewSetup(load)(ctx);
    const transform = ctx.skill.transform.mock.calls[0][0];
    transform({ add: (skill: any) => { skill.content = 'Changed'; } });
    const add = vi.fn();
    transform({ add });

    expect(load).toHaveBeenCalledOnce();
    expect(add).toHaveBeenCalledWith(expect.objectContaining({ content: 'Original' }));
  });

  it('fails activation before registering hooks when assets cannot load', async () => {
    const ctx = mockContext();
    await expect(createDevelopmentCrewSetup(async () => { throw new Error('Unreadable skill'); })(ctx))
      .rejects.toThrow('Unreadable skill');
    expect(ctx.skill.transform).not.toHaveBeenCalled();
    expect(ctx.session.hook).not.toHaveBeenCalled();
  });

  it('starts optional updates after registration and returns their cleanup', async () => {
    const ctx = mockContext();
    const cleanup = vi.fn();
    const startUpdate = vi.fn(() => {
      expect(ctx.skill.transform).toHaveBeenCalledOnce();
      expect(ctx.session.hook).toHaveBeenCalledOnce();
      return cleanup;
    });
    expect(await createDevelopmentCrewSetup(undefined, startUpdate)(ctx)).toBe(cleanup);
    expect(startUpdate).toHaveBeenCalledExactlyOnceWith(ctx);
  });

  it('does not start updates when skill loading fails', async () => {
    const ctx = mockContext();
    const startUpdate = vi.fn();
    await expect(createDevelopmentCrewSetup(async () => { throw new Error('Unreadable skill'); }, startUpdate)(ctx))
      .rejects.toThrow('Unreadable skill');
    expect(startUpdate).not.toHaveBeenCalled();
  });

  it('keeps skills and bootstrap active if optional update scheduling fails', async () => {
    const ctx = mockContext();
    await expect(createDevelopmentCrewSetup(undefined, () => { throw new Error('Cannot schedule'); })(ctx))
      .resolves.toBeUndefined();
    expect(ctx.skill.transform).toHaveBeenCalledOnce();
    const event = { system: [] };
    await ctx.session.hook.mock.calls[0][1](event);
    expect(event.system[0].text).toContain('Development Crew');
  });
});

describe('bootstrap context hook', () => {
  it('adds system instructions without changing messages or existing instructions', async () => {
    const hook = await getContextHook();
    const original = { type: 'text', text: 'Project instructions' };
    const messages = [{ role: 'user', content: [{ type: 'text', text: 'Help me' }] }];
    const event = { system: [original], messages };
    await hook(event);
    await hook(event);

    expect(event.system).toHaveLength(2);
    expect(event.system[0]).toBe(original);
    expect(event.system[1].text).toContain('Development Crew');
    expect(event.system[1].text).toContain('<!-- development-crew-bootstrap -->');
    expect(event.messages).toEqual([{ role: 'user', content: [{ type: 'text', text: 'Help me' }] }]);
  });

  it('injects again into fresh context after continuations or compaction', async () => {
    const hook = await getContextHook();
    const first = { system: [], messages: [] };
    const rebuilt = { system: [], messages: [{ role: 'assistant', content: [] }] };
    await hook(first);
    await hook(rebuilt);
    expect(first.system).toHaveLength(1);
    expect(rebuilt.system).toEqual(first.system);
  });

  it('does not mistake the Development Crew name for injected instructions', async () => {
    const hook = await getContextHook();
    const event = { system: [{ type: 'text', text: 'Use Development Crew' }] };
    await hook(event);
    expect(event.system).toHaveLength(2);
  });

  it.each([
    '<!-- development-crew-bootstrap -->',
    'Idempotency: uses `<!-- development-crew-bootstrap -->` marker to avoid double injection.',
    'The bootstrap marker is:\n\n<!-- development-crew-bootstrap -->',
  ])('injects when instructions only mention the bootstrap marker: %s', async (text) => {
    const hook = await getContextHook();
    const original = { type: 'text', text };
    const event = { system: [original] };
    await hook(event);
    await hook(event);

    expect(event.system).toHaveLength(2);
    expect(event.system[0]).toBe(original);
    expect(event.system[1].text).toContain('Development Crew');
    expect(event.system[1].text).toContain('<!-- development-crew-bootstrap -->');
  });

  it('recognizes a complete bootstrap block in a separate context', async () => {
    const hook = await getContextHook();
    const first = { system: [] };
    await hook(first);

    const existing = { ...first.system[0] };
    const next = { system: [existing] };
    await hook(next);
    expect(next.system).toEqual([existing]);
    expect(next.system[0]).toBe(existing);
  });

  it.each([
    { skills: [] },
    { skills: [{ id: 'using-development-crew', content: '  ' }] },
  ])('skips injection when bootstrap instructions are absent or empty', async ({ skills }) => {
    const hook = await getContextHook(async () => skills);
    const event = { system: [] };
    await hook(event);
    expect(event.system).toEqual([]);
  });
});
