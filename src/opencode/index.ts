import type { Plugin } from '@opencode-ai/plugin';
import { agents, skillsPaths } from './skills';

const DevelopmentCrewPlugin: Plugin = async (_ctx) => {
  return {
    name: 'development-crew',
    agent: agents,
    config: async (opencodeConfig: Record<string, unknown>) => {
      // Shallow per-agent merge: plugin provides defaults, user overrides win
      const isPlainObject = (v: unknown): v is Record<string, unknown> =>
        v !== null && typeof v === 'object' && !Array.isArray(v);

      // Register the rubber-duck agent
      if (!isPlainObject(opencodeConfig.agent)) {
        opencodeConfig.agent = { ...agents };
      } else {
        const configAgents = opencodeConfig.agent;
        for (const [name, pluginAgent] of Object.entries(agents)) {
          const existing = configAgents[name];
          if (isPlainObject(existing)) {
            configAgents[name] = { ...pluginAgent, ...existing };
          } else {
            configAgents[name] = { ...pluginAgent };
          }
        }
      }

      // Register skills paths for specialist agents (architect, implementer, code-reviewer, using-development-crew)
      if (!isPlainObject(opencodeConfig.skills)) {
        opencodeConfig.skills = { paths: skillsPaths };
      } else {
        const skillsConfig = opencodeConfig.skills;
        if (!Array.isArray(skillsConfig.paths)) {
          skillsConfig.paths = [];
        }
        // Prepend plugin skills paths so they are found first
        skillsConfig.paths = [...skillsPaths, ...(skillsConfig.paths as string[])];
      }
    },
  };
};

export default DevelopmentCrewPlugin;
