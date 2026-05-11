import rubberDuckMd from '../../agents/rubber-duck.agent.md';
import architectMd from '../../agents/architect.agent.md';
import implementerMd from '../../agents/implementer.agent.md';
import codeReviewerMd from '../../agents/code-reviewer.agent.md';
import orchestratorMd from '../../agents/orchestrator.agent.md';
import repoScoutMd from '../../agents/repo-scout.agent.md';

import { parseAgentMd } from './parse-agent-md';

interface AgentConfig {
  description: string;
  prompt: string;
}

function buildAgentConfigs(): Record<string, AgentConfig> {
  const sources: Record<string, string> = {
    'RubberDuck': rubberDuckMd,
    'Architect': architectMd,
    'Implementer': implementerMd,
    'CodeReviewer': codeReviewerMd,
    'Orchestrator': orchestratorMd,
    'RepoScout': repoScoutMd,
  };

  const agents: Record<string, AgentConfig> = {};

  for (const [key, raw] of Object.entries(sources)) {
    try {
      const { name, description, prompt } = parseAgentMd(raw);
      agents[key] = {
        description: `${name} — ${description}`,
        prompt,
      };
    } catch (err) {
      throw new Error(
        `Failed to parse agent "${key}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return agents;
}

export const agents = buildAgentConfigs();
