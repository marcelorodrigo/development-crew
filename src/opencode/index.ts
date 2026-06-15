import type { Plugin } from '@opencode-ai/plugin';
import usingDevCrewMd from '../../skills/using-development-crew/SKILL.md';
import path from 'node:path';

function getBootstrapContent(): string {
  // Strip YAML frontmatter (--- ... ---\n) and return the body only
  const match = usingDevCrewMd.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : usingDevCrewMd.trim();
}

const DevelopmentCrewPlugin: Plugin = async (_ctx) => {
  const skillsDir = path.resolve(import.meta.dirname, '../../skills');

  return {
    name: 'development-crew',

    config: async (opencodeConfig: Record<string, unknown>) => {
      const cfg = opencodeConfig as Record<string, unknown> & {
        skills?: { paths?: string[] };
      };
      cfg.skills = cfg.skills ?? {};
      cfg.skills.paths = cfg.skills.paths ?? [];
      if (!cfg.skills.paths.includes(skillsDir)) {
        cfg.skills.paths.push(skillsDir);
      }
    },

    'experimental.chat.messages.transform': async (
      _input: unknown,
      output: {
        messages: Array<{
          info: { role: string };
          parts: Array<{ type: string; text?: string }>;
        }>;
      },
    ) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;

      const firstUser = output.messages.find((m) => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      // Idempotency guard: skip if bootstrap content already injected
      const alreadyInjected = firstUser.parts.some(
        (p) => p.type === 'text' && p.text?.includes('Development Crew'),
      );
      if (alreadyInjected) return;

      firstUser.parts.unshift({ type: 'text', text: bootstrap });
    },
  };
};

export default DevelopmentCrewPlugin;
