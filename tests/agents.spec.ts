import { describe, expect, it } from 'vitest';
import { agents } from '../src/opencode/agents';

const AGENT_NAMES = [
  'dc:rubber-duck',
  'dc:architect',
  'dc:implementer',
  'dc:code-reviewer',
  'dc:orchestrator',
] as const;

const PREAMBLE_AGENTS = new Set([
  'dc:architect',
  'dc:implementer',
  'dc:code-reviewer',
]);

const SHARED_DESIGN_PRINCIPLES = '# Shared Design Principles';

describe('agents', () => {
  it('exports exactly 5 agents with correct keys', () => {
    const keys = Object.keys(agents);
    expect(keys).toHaveLength(5);
    for (const name of AGENT_NAMES) {
      expect(keys).toContain(name);
    }
  });

  it.each(AGENT_NAMES)('%s has non-empty description and prompt', (name) => {
    const agent = agents[name];
    expect(agent.description).toBeTruthy();
    expect(agent.description.length).toBeGreaterThan(10);
    expect(agent.prompt).toBeTruthy();
    expect(agent.prompt.length).toBeGreaterThan(100);
  });

  it.each(AGENT_NAMES)('%s has a permission block', (name) => {
    const agent = agents[name];
    expect(agent.permission).toBeDefined();
    expect(Object.keys(agent.permission!)).not.toHaveLength(0);
  });

  for (const name of PREAMBLE_AGENTS) {
    it(`${name} prompt includes shared design principles`, () => {
      const agent = agents[name];
      expect(agent.prompt).toContain(SHARED_DESIGN_PRINCIPLES);
    });
  }

  for (const name of PREAMBLE_AGENTS) {
    it(`${name} prompt has its own identity after shared principles`, () => {
      const prompt = agents[name].prompt;
      const principlesIdx = prompt.indexOf(SHARED_DESIGN_PRINCIPLES);
      const identityIdx = prompt.indexOf('# Identity');
      expect(principlesIdx).toBeGreaterThanOrEqual(0);
      expect(identityIdx).toBeGreaterThanOrEqual(0);
      // Identity section must come AFTER shared principles
      expect(identityIdx).toBeGreaterThan(principlesIdx);
    });
  }

  it('rubber-duck and orchestrator do NOT include shared principles', () => {
    const nonPreamble = AGENT_NAMES.filter((n) => !PREAMBLE_AGENTS.has(n));
    for (const name of nonPreamble) {
      expect(agents[name].prompt).not.toContain(SHARED_DESIGN_PRINCIPLES);
    }
  });
});

// Regression test for PR #95:
// Prepending shared-principles.md before the YAML frontmatter fence (---)
// caused parseAgentMd to throw for preamble agents, killing the entire plugin
// load. This was shipped in v0.8.1.
describe('buildAgentConfigs assembly (regression test for PR #95)', () => {
  it('does not throw for any agent', () => {
    expect(() => agents).not.toThrow();
  });

  it('preamble agents have parseable frontmatter -- identity section is present', () => {
    // If shared principles were prepended before the --- fence, parseAgentMd
    // would throw and no agent would have a prompt. This confirms the fix
    // (PR #95): parseAgentMd(raw) is called on raw first, then preamble is
    // prepended to the prompt string only.
    for (const name of PREAMBLE_AGENTS) {
      expect(agents[name].prompt).toContain('# Identity');
    }
  });

  it('all 5 agents have prompts that do not start with raw YAML fence debris', () => {
    for (const name of AGENT_NAMES) {
      const prompt = agents[name].prompt;
      // A broken parse leaves frontmatter in the prompt body
      expect(prompt.trimStart()).not.toMatch(/^---/);
      expect(prompt.trimStart()).not.toMatch(/^name:/);
    }
  });
});