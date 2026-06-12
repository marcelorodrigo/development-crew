import rubberDuckMd from '../../agents/rubber-duck.agent.md';
import architectMd from '../../agents/architect.agent.md';
import implementerMd from '../../agents/implementer.agent.md';
import codeReviewerMd from '../../agents/code-reviewer.agent.md';
import orchestratorMd from '../../agents/orchestrator.agent.md';
import sharedPrinciplesMd from '../../agents/shared-principles.md';

import { parseAgentMd } from './parse-agent-md';

// Agents that receive the shared design-principles preamble
const PREAMBLE_AGENTS = new Set(['dc-architect', 'dc-implementer', 'dc-code-reviewer']);

interface AgentConfig {
  description: string;
  prompt: string;
  permission?: import('./parse-agent-md').AgentPermission;
}

function buildAgentConfigs(): Record<string, AgentConfig> {
  const sources: Record<string, string> = {
    'dc-rubber-duck': rubberDuckMd,
    'dc-architect': architectMd,
    'dc-implementer': implementerMd,
    'dc-code-reviewer': codeReviewerMd,
    'dc-orchestrator': orchestratorMd,
  };

  const agents: Record<string, AgentConfig> = {};

  for (const [key, raw] of Object.entries(sources)) {
    try {
      const rawWithPreamble = PREAMBLE_AGENTS.has(key)
        ? sharedPrinciplesMd.trim() + '\n\n' + raw
        : raw;
      const { name, description, prompt, permission } = parseAgentMd(rawWithPreamble);
      const config: AgentConfig = {
        description: `${name} — ${description}`,
        prompt,
      };
      if (permission) {
        config.permission = permission;
      }
      agents[key] = config;
    } catch (err) {
      throw new Error(
        `Failed to parse agent "${key}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return agents;
}

export const agents = buildAgentConfigs();
