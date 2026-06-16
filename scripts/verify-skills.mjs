/**
 * Verifies that every skills/*\/SKILL.md file has valid frontmatter (name + description)
 * and that the bootstrap skill body (skills/using-development-crew/SKILL.md) is
 * embedded in dist/index.js.
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

/**
 * Modular validators for skill metadata fields.
 * Each validator returns an array of error messages (empty = valid).
 */
const validators = {

  /**
   * Validate the `name` field per the Agent Skills spec:
   * - Max 64 characters
   * - Only lowercase alphanumeric (a-z, 0-9) and hyphens
   * - No consecutive hyphens
   * - No leading or trailing hyphens
   * - Must match the parent directory name
   * @param {string} name
   * @param {string} dirName
   * @param {string} filePath
   * @returns {string[]}
   */
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

  /**
   * Validate the `description` field per the Agent Skills spec:
   * - Max 1024 characters
   * - Non-empty (already guaranteed by parseSkillMd)
   * @param {string} description
   * @param {string} filePath
   * @returns {string[]}
   */
  description(description, filePath) {
    const errors = [];
    if (description.length > 1024) {
      errors.push(`${filePath}: description must be at most 1024 characters (got ${description.length})`);
    }
    return errors;
  },

};

let distContent;
try {
  distContent = readFileSync('dist/index.js', 'utf-8');
} catch {
  console.error('ERROR: dist/index.js not found — run `pnpm run build` first');
  process.exit(1);
}

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

// Verify bootstrap skill body is embedded in the bundle.
// tsup's text loader inlines .md files as JS string literals, where newlines
// are stored as the two-character escape sequence `\n` rather than literal
// newlines. We therefore escape the body before searching.
const bootstrapPath = join(skillsDir, 'using-development-crew', 'SKILL.md');
try {
  const raw = readFileSync(bootstrapPath, 'utf-8');
  const { body } = parseSkillMd(raw, bootstrapPath);
  if (!body) {
    console.error(`ERROR: Bootstrap skill body is empty: ${bootstrapPath}`);
    failed = true;
  } else {
    // Take a distinctive substring from the body to avoid false positives.
    // We use a later portion of the body (past the heading line) to avoid
    // issues with Unicode characters in headings being encoded differently
    // by tsup's bundler (e.g. em-dash → \u2014).
    const bodyLines = body.split('\n');
    // Skip the first heading line; use the first non-empty non-heading line
    const anchorLine = bodyLines.find((l) => l.trim() && !l.startsWith('#'));
    if (!anchorLine) {
      console.error(`ERROR: Bootstrap skill body has no verifiable content: ${bootstrapPath}`);
      failed = true;
    } else {
      const snippet = anchorLine.slice(0, 80).replace(/\n/g, '\\n');
      if (!distContent.includes(snippet)) {
        console.error(
          `ERROR: Bootstrap skill body not found in dist/index.js (checked: ${JSON.stringify(snippet)})`,
        );
        failed = true;
      } else {
        console.log(`OK: Bootstrap skill body embedded in dist/index.js`);
      }
    }
  }
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`All ${count} skill files verified.`);
