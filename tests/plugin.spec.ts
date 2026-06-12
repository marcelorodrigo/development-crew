import { describe, expect, it } from 'vitest';
import DevelopmentCrewPlugin from '../src/opencode/index';

function mockPluginInput() {
  return {
    client: {} as ReturnType<typeof import('@opencode-ai/sdk').createOpencodeClient>,
    project: { id: 'test', name: 'test-project' },
    directory: '/tmp/test',
    worktree: '/tmp/test',
    serverUrl: new URL('http://localhost:3000'),
    $: {} as any,
    experimental_workspace: {
      register: () => {},
    },
  };
}

describe('DevelopmentCrewPlugin', () => {
  it('returns the expected hooks shape', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());

    expect(hooks.name).toBe('development-crew');
    expect(hooks.agent).toBeDefined();
    expect(typeof hooks.config).toBe('function');
    expect(Object.keys(hooks.agent!)).toHaveLength(5);
  });
});

describe('config merge', () => {
  it('sets agent when opencodeConfig.agent is missing', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const cfg = {} as Record<string, unknown>;

    await hooks.config!(cfg);

    expect(cfg.agent).toBeDefined();
    expect(Object.keys(cfg.agent as object)).toHaveLength(5);
  });

  it('sets agent when opencodeConfig.agent is not a plain object', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const cfg = { agent: ['not-an-object'] as unknown };

    await hooks.config!(cfg);

    expect(cfg.agent).toBeDefined();
    expect(Object.keys(cfg.agent as object)).toHaveLength(5);
    expect(Array.isArray(cfg.agent)).toBe(false);
  });

  it('merges into existing agent config, preserving user overrides', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const userOverride = { description: 'my custom desc', model: 'custom-model' };
    const cfg = {
      agent: {
        'dc:rubber-duck': userOverride,
      },
    } as Record<string, unknown>;

    await hooks.config!(cfg);

    const agents = cfg.agent as Record<string, Record<string, unknown>>;
    expect(agents['dc:rubber-duck'].description).toBe('my custom desc');
    expect(agents['dc:rubber-duck'].model).toBe('custom-model');
    // Plugin-supplied fields still present
    expect(agents['dc:rubber-duck'].prompt).toBeDefined();
  });

  it('fills in missing agents without touching existing ones', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const cfg = {
      agent: {
        'dc:rubber-duck': { description: 'custom' },
      },
    } as Record<string, unknown>;

    await hooks.config!(cfg);

    const agents = cfg.agent as Record<string, Record<string, unknown>>;
    // User's agent preserved
    expect(agents['dc:rubber-duck'].description).toBe('custom');
    // Other agents added by plugin
    expect(agents['dc:architect']).toBeDefined();
    expect(agents['dc:implementer']).toBeDefined();
    expect(agents['dc:code-reviewer']).toBeDefined();
    expect(agents['dc:orchestrator']).toBeDefined();
    expect(Object.keys(agents)).toHaveLength(5);
  });
});