import { describe, expect, it, vi } from 'vitest';
import { createDevelopmentCrewPlugin } from '../lib/development-crew.js';

const DevelopmentCrewPlugin = createDevelopmentCrewPlugin(() => {});

function mockPluginInput() {
  return {
    client: {},
    project: { id: 'test', name: 'test-project' },
    directory: '/tmp/test',
    worktree: '/tmp/test',
    serverUrl: new URL('http://localhost:3000'),
    $: {},
    experimental_workspace: {
      register: () => {},
    },
  };
}

type MessagePart = { type: string; text?: string };
type Message = { info: { role: string }; parts: MessagePart[] };
type TransformOutput = { messages: Message[] };

function makeUserMessage(text: string): Message {
  return { info: { role: 'user' }, parts: [{ type: 'text', text }] };
}

function makeAssistantMessage(text: string): Message {
  return { info: { role: 'assistant' }, parts: [{ type: 'text', text }] };
}

describe('DevelopmentCrewPlugin', () => {
  it('starts the updater once during plugin initialization', async () => {
    const startUpdate = vi.fn();
    const plugin = createDevelopmentCrewPlugin(startUpdate);

    await plugin(mockPluginInput());

    expect(startUpdate).toHaveBeenCalledOnce();
  });

  it('prepares runtime assets before starting the updater', async () => {
    const events: string[] = [];
    const prepareAssets = vi.fn(async () => {
      events.push('prepare');
      return { skillsDir: '/tmp/runtime-skills', bootstrapContent: '---\nname: test\n---\nBootstrap' };
    });
    const startUpdate = vi.fn(() => events.push('update'));

    await createDevelopmentCrewPlugin(startUpdate, prepareAssets)(mockPluginInput());

    expect(events).toEqual(['prepare', 'update']);
  });

  it('registers the prepared skills snapshot', async () => {
    const plugin = createDevelopmentCrewPlugin(() => {}, async () => ({
      skillsDir: '/tmp/runtime-skills',
      bootstrapContent: '---\nname: test\n---\nBootstrap',
    }));
    const hooks = await plugin(mockPluginInput());
    const cfg = {} as Record<string, unknown>;

    await hooks.config!(cfg);

    expect((cfg.skills as { paths: string[] }).paths).toEqual(['/tmp/runtime-skills']);
  });

  it('keeps startup non-fatal and skips the updater when preparation fails', async () => {
    const startUpdate = vi.fn();
    const plugin = createDevelopmentCrewPlugin(startUpdate, async () => {
      throw new Error('copy failed');
    });

    const hooks = await plugin(mockPluginInput());

    expect(hooks.name).toBe('development-crew');
    expect(startUpdate).not.toHaveBeenCalled();
  });

  it('returns name development-crew', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    expect(hooks.name).toBe('development-crew');
  });

  it('has a config function', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    expect(typeof hooks.config).toBe('function');
  });

  it('has an experimental.chat.messages.transform function', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    expect(typeof (hooks as Record<string, unknown>)['experimental.chat.messages.transform']).toBe('function');
  });

  it('does NOT have an agent key', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    expect((hooks as Record<string, unknown>)['agent']).toBeUndefined();
  });
});

describe('config hook', () => {
  it('initializes skills.paths when absent', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const cfg = {} as Record<string, unknown>;

    await hooks.config!(cfg);

    const skills = cfg.skills as { paths: string[] };
    expect(skills).toBeDefined();
    expect(Array.isArray(skills.paths)).toBe(true);
    expect(skills.paths.length).toBe(1);
  });

  it('appends skills dir to existing paths', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const cfg = { skills: { paths: ['/some/other/skills'] } } as Record<string, unknown>;

    await hooks.config!(cfg);

    const skills = cfg.skills as { paths: string[] };
    expect(skills.paths.length).toBe(2);
    expect(skills.paths[0]).toBe('/some/other/skills');
    expect(skills.paths[1]).toContain('skills');
  });

  it('does not add duplicate paths on double-call', async () => {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    const cfg = {} as Record<string, unknown>;

    await hooks.config!(cfg);
    await hooks.config!(cfg);

    const skills = cfg.skills as { paths: string[] };
    expect(skills.paths.length).toBe(1);
  });
});

describe('experimental.chat.messages.transform hook', () => {
  async function getTransformHook() {
    const hooks = await DevelopmentCrewPlugin(mockPluginInput());
    return (hooks as Record<string, unknown>)['experimental.chat.messages.transform'] as (
      input: unknown,
      output: TransformOutput,
    ) => Promise<void>;
  }

  it('is a no-op when messages array is empty', async () => {
    const transform = await getTransformHook();
    const output: TransformOutput = { messages: [] };

    await transform(null, output);

    expect(output.messages).toHaveLength(0);
  });

  it('is a no-op when there is no user message', async () => {
    const transform = await getTransformHook();
    const output: TransformOutput = {
      messages: [makeAssistantMessage('hello')],
    };

    await transform(null, output);

    expect(output.messages[0].parts).toHaveLength(1);
  });

  it('prepends bootstrap content to the first user message', async () => {
    const transform = await getTransformHook();
    const output: TransformOutput = {
      messages: [makeUserMessage('do something')],
    };

    await transform(null, output);

    const parts = output.messages[0].parts;
    expect(parts).toHaveLength(2);
    expect(parts[0].type).toBe('text');
    expect(parts[0].text).toBeTruthy();
    expect(parts[0].text).toContain('Development Crew');
    expect(parts[1].text).toBe('do something');
  });

  it('uses the prepared bootstrap content', async () => {
    const hooks = await createDevelopmentCrewPlugin(
      () => {},
      async () => ({
        skillsDir: '/tmp/runtime-skills',
        bootstrapContent: '---\nname: test\n---\nSnapshot bootstrap',
      }),
    )(mockPluginInput());
    const transform = (hooks as Record<string, unknown>)[
      'experimental.chat.messages.transform'
    ] as (input: unknown, output: TransformOutput) => Promise<void>;
    const output: TransformOutput = { messages: [makeUserMessage('do something')] };

    await transform(null, output);

    expect(output.messages[0].parts[0].text).toContain('Snapshot bootstrap');
  });

  it('does not inject bootstrap a second time (idempotency)', async () => {
    const transform = await getTransformHook();
    const output: TransformOutput = {
      messages: [makeUserMessage('do something')],
    };

    await transform(null, output);
    await transform(null, output);

    expect(output.messages[0].parts).toHaveLength(2);
  });

  it('injects bootstrap even if user message already contains "Development Crew" (marker-based idempotency)', async () => {
    const transform = await getTransformHook();
    const output: TransformOutput = {
      messages: [makeUserMessage('I want to use Development Crew for this task')],
    };

    await transform(null, output);

    const parts = output.messages[0].parts;
    expect(parts).toHaveLength(2);
    expect(parts[0].text).toContain('Development Crew');
    expect(parts[1].text).toBe('I want to use Development Crew for this task');
  });

  it('does not mutate assistant messages', async () => {
    const transform = await getTransformHook();
    const output: TransformOutput = {
      messages: [
        makeAssistantMessage('initial assistant'),
        makeUserMessage('user question'),
      ],
    };

    await transform(null, output);

    expect(output.messages[0].parts).toHaveLength(1);
    expect(output.messages[0].parts[0].text).toBe('initial assistant');
  });
});
