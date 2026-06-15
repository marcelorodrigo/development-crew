import rubberDuckMd from '../../agents/rubber-duck.agent.md';
import { parseAgentMd } from './parse-agent-md';

interface AgentConfig {
  description: string;
  prompt: string;
  permission?: import('./parse-agent-md').AgentPermission;
}

/**
 * Build the rubber-duck agent configuration.
 * The rubber-duck agent is the only named agent in OpenCode.
 * Other specialist agents (architect, implementer, code-reviewer) are provided
 * as skills in the skills/ directory and are registered via config.skills.paths.
 */
function buildRubberDuckAgent(): Record<string, AgentConfig> {
  try {
    const key = 'dc:rubber-duck';
    const { name, description, prompt, permission } = parseAgentMd(rubberDuckMd);
    const config: AgentConfig = {
      description: `${name} — ${description}`,
      prompt: prompt,
    };
    if (permission) {
      config.permission = permission;
    }
    return { [key]: config };
  } catch (err) {
    throw new Error(
      `Failed to parse rubber-duck agent: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export const agents = buildRubberDuckAgent();

/**
 * Paths where skills are located.
 * These are registered with opencode config via plugin.config hook.
 */
export const skillsPaths = ['./skills'];
