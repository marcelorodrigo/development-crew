import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export function parseSkill(raw, directory, filePath) {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  const metadata = {};

  for (const line of match?.[1].split('\n') || []) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
  }

  if (metadata.name !== directory || !metadata.description) {
    throw new Error(`Invalid Development Crew skill ${filePath}: name must match ${directory} and description is required`);
  }

  return {
    id: metadata.name,
    name: metadata.name,
    description: metadata.description,
    path: filePath,
    content: match[2],
  };
}

export async function loadSkills(skillsDir) {
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  return Promise.all(directories.map(async (directory) => {
    const filePath = join(skillsDir, directory, 'SKILL.md');
    let raw;
    try {
      raw = await readFile(filePath, 'utf8');
    } catch (cause) {
      throw new Error(`Cannot read Development Crew skill ${filePath}`, { cause });
    }
    return parseSkill(raw, directory, filePath);
  }));
}
