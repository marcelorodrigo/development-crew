import type { Plugin } from '@opencode-ai/plugin';
import { agents } from './agents';

const SpringCrewPlugin: Plugin = async (_ctx) => {
  return {
    name: 'spring-crew-plugin',
    agent: agents,
    config: async (opencodeConfig: Record<string, unknown>) => {
      // Shallow per-agent merge: plugin provides defaults, user overrides win
      const isPlainObject = (v: unknown): v is Record<string, unknown> =>
        v !== null && typeof v === 'object' && !Array.isArray(v);

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
    },
  };
};

export default SpringCrewPlugin;
