import { describe, expect, it, vi } from 'vitest';
import DevelopmentCrewPlugin from '../.opencode/plugins/development-crew.js';

interface SystemPart {
  type: string;
  text?: string;
}

interface SkillDraft {
  add: (skill: unknown) => void;
}

interface MockCtx {
  skill: {
    transform: ReturnType<typeof vi.fn>;
  };
  session: {
    hook: ReturnType<typeof vi.fn>;
  };
  _registeredSkills: unknown[];
  _hooks: {
    context: Array<(event: { system: SystemPart[] }) => void>;
  };
}

function mockCtx(): MockCtx {
  const registeredSkills: unknown[] = [];
  const hooks: MockCtx['_hooks'] = { context: [] };

  const ctx: MockCtx = {
    skill: {
      transform: vi.fn(async (callback: (draft: SkillDraft) => void) => {
        callback({
          add: (skill) => registeredSkills.push(skill),
        });
      }),
    },
    session: {
      hook: vi.fn(async (name: 'context', callback: (event: { system: SystemPart[] }) => void) => {
        hooks[name].push(callback);
      }),
    },
    _registeredSkills: registeredSkills,
    _hooks: hooks,
  };

  return ctx;
}

async function setupPlugin() {
  const ctx = mockCtx();
  await DevelopmentCrewPlugin.setup(ctx);
  return ctx;
}

describe('DevelopmentCrewPlugin', () => {
  it('exports a V2 plugin with id development-crew', () => {
    expect(DevelopmentCrewPlugin.id).toBe('development-crew');
    expect(typeof DevelopmentCrewPlugin.setup).toBe('function');
  });

  it('registers all skills from skills/ directory', async () => {
    const ctx = await setupPlugin();

    expect(ctx.skill.transform).toHaveBeenCalledTimes(1);
    expect(ctx._registeredSkills.length).toBeGreaterThan(0);

    const skillIds = ctx._registeredSkills.map((s) => (s as { id: string }).id);
    expect(skillIds).toContain('using-development-crew');
    expect(skillIds).toContain('rubber-duck');
    expect(skillIds).toContain('architect');
    expect(skillIds).toContain('implementer');
    expect(skillIds).toContain('code-reviewer');
    expect(skillIds).toContain('shared-principles');
  });

  it('registers skills with required metadata', async () => {
    const ctx = await setupPlugin();

    const skill = ctx._registeredSkills.find((s) => (s as { id: string }).id === 'using-development-crew') as {
      id: string;
      name: string;
      description: string;
      location: string;
      content: string;
    };

    expect(skill).toBeDefined();
    expect(skill.name).toBe('using-development-crew');
    expect(skill.description).toContain('Bootstrap skill');
    expect(skill.location).toContain('skills/using-development-crew/SKILL.md');
    expect(skill.content).toContain('Development Crew');
  });

  it('registers a session context hook', async () => {
    const ctx = await setupPlugin();

    expect(ctx.session.hook).toHaveBeenCalledTimes(1);
    expect(ctx.session.hook).toHaveBeenCalledWith('context', expect.any(Function));
  });
});

describe('session context hook', () => {
  async function getContextHook() {
    const ctx = await setupPlugin();
    return ctx._hooks.context[0];
  }

  it('prepends bootstrap content to event.system', async () => {
    const hook = await getContextHook();
    const event = { system: [] as SystemPart[] };

    await hook(event);

    expect(event.system).toHaveLength(1);
    expect(event.system[0].type).toBe('text');
    expect(event.system[0].text).toContain('Development Crew');
    expect(event.system[0].text).toContain('<!-- development-crew-bootstrap -->');
  });

  it('does not inject bootstrap a second time (idempotency)', async () => {
    const hook = await getContextHook();
    const event = { system: [] as SystemPart[] };

    await hook(event);
    await hook(event);

    expect(event.system).toHaveLength(1);
  });

  it('does not inject when marker is already present in system', async () => {
    const hook = await getContextHook();
    const event = {
      system: [{ type: 'text', text: 'existing <!-- development-crew-bootstrap -->' }],
    };

    await hook(event);

    expect(event.system).toHaveLength(1);
    expect(event.system[0].text).toBe('existing <!-- development-crew-bootstrap -->');
  });
});
