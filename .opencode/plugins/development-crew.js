/**
 * Development Crew plugin for OpenCode 2
 *
 * Registers skills and injects bootstrap context via the V2 plugin API.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Plugin } from '@opencode-ai/plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../../skills');

function extractAndStripFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split(/\r?\n/)) {
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

function getBootstrapContent() {
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
}

function discoverSkills() {
  const skills = [];

  for (const dirName of fs.readdirSync(skillsDir)) {
    const skillPath = path.join(skillsDir, dirName, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;

    const raw = fs.readFileSync(skillPath, 'utf8');
    const { frontmatter, content } = extractAndStripFrontmatter(raw);

    skills.push({
      id: frontmatter.name || dirName,
      name: frontmatter.name || dirName,
      description: frontmatter.description || '',
      location: skillPath,
      content,
    });
  }

  return skills;
}

const BOOTSTRAP_MARKER = '<!-- development-crew-bootstrap -->';

export default Plugin.define({
  id: 'development-crew',

  setup: async (ctx) => {
    const skills = discoverSkills();

    await ctx.skill.transform((draft) => {
      for (const skill of skills) {
        draft.add(skill);
      }
    });

    await ctx.session.hook('context', (event) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap) return;

      const alreadyInjected = event.system.some(
        (part) => part.type === 'text' && part.text?.includes(BOOTSTRAP_MARKER),
      );
      if (alreadyInjected) return;

      event.system.unshift({
        type: 'text',
        text: `${bootstrap}\n\n${BOOTSTRAP_MARKER}`,
      });
    });
  },
});
