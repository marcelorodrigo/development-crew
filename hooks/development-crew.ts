/**
 * Development Crew hook for oh-my-pi
 *
 * Injects the using-development-crew bootstrap into the first user turn.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../skills');

export function extractAndStripFrontmatter(content: string): { frontmatter: Record<string, string>; content: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter: Record<string, string> = {};

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

let _bootstrapCache: string | null | undefined = undefined;

export function getBootstrapContent(): string | null {
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

export function __resetBootstrapCache(): void {
  _bootstrapCache = undefined;
}

interface SessionEntry {
  type: string;
  customType?: string;
}

export function isBootstrapInjected(branch: SessionEntry[]): boolean {
  return branch.some(
    (entry) => entry.type === 'custom' && entry.customType === 'development-crew-bootstrap',
  );
}

export default function developmentCrewHook(pi: any): void {
  pi.on('session_start', async (_event: any, ctx: any) => {
    const branch: SessionEntry[] = ctx.sessionManager?.getBranch?.() ?? [];
    if (isBootstrapInjected(branch)) {
      return;
    }

    const bootstrap = getBootstrapContent();
    if (!bootstrap) {
      return;
    }

    const text = bootstrap + '\n\n<!-- development-crew-bootstrap -->';

    if (typeof pi.sendMessage === 'function') {
      pi.sendMessage(text, { deliverAs: 'nextTurn' });
    }

    if (typeof pi.appendEntry === 'function') {
      pi.appendEntry('development-crew-bootstrap', { injected: true });
    }
  });
}
