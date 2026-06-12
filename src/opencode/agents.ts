import rubberDuckMd from '../../agents/rubber-duck.agent.md';
import architectMd from '../../agents/architect.agent.md';
import implementerMd from '../../agents/implementer.agent.md';
import codeReviewerMd from '../../agents/code-reviewer.agent.md';
import orchestratorMd from '../../agents/orchestrator.agent.md';
import sharedPrinciplesMd from '../../agents/shared-principles.md';

import { parseAgentMd } from './parse-agent-md';

// Agents that receive the shared design-principles preamble
const PREAMBLE_AGENTS = new Set(['dc:architect', 'dc:implementer', 'dc:code-reviewer']);

interface AgentConfig {
  description: string;
  prompt: string;
  permission?: import('./parse-agent-md').AgentPermission;
}

function buildAgentConfigs(): Record<string, AgentConfig> {
  const sources: Record<string, string> = {
    'rubber-duck': rubberDuckMd,
    'architect': architectMd,
    'implementer': implementerMd,
    'code-reviewer': codeReviewerMd,
    'orchestrator': orchestratorMd,
  };

  const agents: Record<string, AgentConfig> = {};

  for (const [slug, raw] of Object.entries(sources)) {
    try {
      const key = `dc:${slug}`;
      const { name, description, prompt, permission } = parseAgentMd(raw);
      const fullPrompt = PREAMBLE_AGENTS.has(key)
        ? sharedPrinciplesMd.trim() + '\n\n' + prompt
        : prompt;
      const config: AgentConfig = {
        description: `${name} — ${description}`,
        prompt: fullPrompt,
      };
      if (permission) {
        config.permission = permission;
      }
      agents[key] = config;
    } catch (err) {
      throw new Error(
        `Failed to parse agent "${slug}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return agents;
}

export const agents = buildAgentConfigs();
