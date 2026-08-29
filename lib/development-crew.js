/**
 * Development Crew plugin for OpenCode.ai
 *
 * Registers skills directory via config hook.
 * Injects bootstrap context via messages transform hook.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startAutoUpdate } from './update.js';
import { prepareRuntimeAssets } from './runtime-assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../skills');

function extractAndStripFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
}

export const createDevelopmentCrewPlugin = (
  startUpdate = startAutoUpdate,
  prepareAssets = () => prepareRuntimeAssets(skillsDir, 'using-development-crew/SKILL.md'),
) => async (ctx) => {
  let runtimeAssets;
  try {
    runtimeAssets = await prepareAssets();
  } catch {
    runtimeAssets = null;
  }

  if (runtimeAssets) startUpdate(ctx);

  return {
    name: 'development-crew',

    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      const configuredSkillsDir = runtimeAssets?.skillsDir || skillsDir;
      if (!config.skills.paths.includes(configuredSkillsDir)) {
        config.skills.paths.push(configuredSkillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = runtimeAssets?.bootstrapContent
        ? extractAndStripFrontmatter(runtimeAssets.bootstrapContent).content
        : null;
      if (!bootstrap || !output.messages.length) return;

      const firstUser = output.messages.find((m) => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      const alreadyInjected = firstUser.parts.some(
        (p) => p.type === 'text' && p.text?.includes('<!-- development-crew-bootstrap -->'),
      );
      if (alreadyInjected) return;

      const text = bootstrap + '\n\n<!-- development-crew-bootstrap -->';

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text });
    },
  };
};
