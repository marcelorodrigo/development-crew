/**
 * Validates that every skills/*\/SKILL.md file has valid frontmatter (name + description).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Parse frontmatter from a SKILL.md file.
 * Returns { name, description, body } or throws on malformed input.
 * @param {string} raw - Raw file content
 * @param {string} filePath - File path for error messages
 * @returns {{ name: string, description: string, body: string }}
 */
function parseSkillMd(raw, filePath) {
  const lines = raw.split('\n');

  if (lines[0]?.trim() !== '---') {
    throw new Error(`${filePath}: Missing opening frontmatter fence (---)`);
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    throw new Error(`${filePath}: Missing closing frontmatter fence (---)`);
  }

  const frontmatterLines = lines.slice(1, closingIndex);
  let name = '';
  let description = '';

  for (const line of frontmatterLines) {
    const nameMatch = line.match(/^name:\s*(.+)$/);
    if (nameMatch) {
      name = nameMatch[1].trim();
      continue;
    }
    const descMatch = line.match(/^description:\s*(.+)$/);
    if (descMatch) {
      description = descMatch[1].trim();
    }
  }

  if (!name) {
    throw new Error(`${filePath}: Frontmatter missing required "name" field`);
  }
  if (!description) {
    throw new Error(`${filePath}: Frontmatter missing required "description" field`);
  }

  const body = lines.slice(closingIndex + 1).join('\n').trim();
  return { name, description, body };
}

const validators = {
  name(name, dirName, filePath) {
    const errors = [];
    if (name.length > 64) {
      errors.push(`${filePath}: name must be at most 64 characters (got ${name.length})`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      errors.push(
        `${filePath}: name "${name}" must contain only lowercase alphanumeric characters and hyphens, ` +
        'with no leading, trailing, or consecutive hyphens',
      );
    }
    if (name !== dirName) {
      errors.push(`${filePath}: name "${name}" does not match directory name "${dirName}"`);
    }
    return errors;
  },

  description(description, filePath) {
    const errors = [];
    if (description.length > 1024) {
      errors.push(`${filePath}: description must be at most 1024 characters (got ${description.length})`);
    }
    return errors;
  },
};

// Discover all skill directories (direct children of skills/ that contain SKILL.md)
const skillsDir = 'skills';
const skillDirs = readdirSync(skillsDir)
  .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
  .sort();

let failed = false;
let count = 0;

for (const dirName of skillDirs) {
  const filePath = join(skillsDir, dirName, 'SKILL.md');
  let meta;
  try {
    const raw = readFileSync(filePath, 'utf-8');
    meta = parseSkillMd(raw, filePath);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    failed = true;
    continue;
  }

  const nameErrors = validators.name(meta.name, dirName, filePath);
  for (const err of nameErrors) {
    console.error(`ERROR: ${err}`);
    failed = true;
  }

  const descErrors = validators.description(meta.description, filePath);
  for (const err of descErrors) {
    console.error(`ERROR: ${err}`);
    failed = true;
  }

  if (!failed || nameErrors.length === 0) {
    console.log(`OK: ${filePath} (name: ${meta.name})`);
  }
  count++;
}

if (failed) {
  process.exit(1);
}

console.log(`All ${count} skill files verified.`);
