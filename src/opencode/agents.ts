import rubberDuckMd from '../../agents/rubber-duck.agent.md';
import architectMd from '../../agents/architect.agent.md';
import implementerMd from '../../agents/implementer.agent.md';
import codeReviewerMd from '../../agents/code-reviewer.agent.md';
import orchestratorMd from '../../agents/orchestrator.agent.md';

import { parseAgentMd } from './parse-agent-md';

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
      const { name, description, prompt, permission } = parseAgentMd(raw);
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
