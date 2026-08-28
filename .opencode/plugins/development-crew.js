/**
 * Development Crew plugin for OpenCode.ai
 *
 * Registers skills directory via config hook.
 * Injects bootstrap context via messages transform hook.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startAutoUpdate } from './update.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../../skills');

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

let _bootstrapCache = undefined;

export const createDevelopmentCrewPlugin = (startUpdate = startAutoUpdate) => async (ctx) => {
  startUpdate(ctx);

  const getBootstrapContent = () => {
    if (_bootstrapCache !== undefined) return _bootstrapCache;

    const skillPath = path.join(skillsDir, 'using-development-crew', 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      _bootstrapCache = null;
      return null;
    }

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);
    _bootstrapCache = content;
    return _bootstrapCache;
  };

  return {
    name: 'development-crew',

    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
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

const DevelopmentCrewPlugin = createDevelopmentCrewPlugin();

export default DevelopmentCrewPlugin;
