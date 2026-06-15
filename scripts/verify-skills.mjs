/**
 * Verifies that:
 * 1. The rubber-duck agent is embedded in dist/index.js
 * 2. All skills in the skills directory have valid frontmatter (name, description)
 * 3. The rubber-duck agent's permission block is embedded in the bundle
 *
 * Mirrors the parseAgentMd and parseSkillMd logic from src/opencode to use
 * the same frontmatter parsing rules as the runtime.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {"ask" | "allow" | "deny"} PermissionAction */
/** @typedef {Record<string, PermissionAction | Record<string, PermissionAction>>} AgentPermission */

/**
 * Validates a permission action value. Throws on unknown actions.
 * @param {string} value
 * @returns {PermissionAction}
 */
function validatePermissionAction(value) {
  if (value === 'ask' || value === 'allow' || value === 'deny') return value;
  throw new Error(
    `Invalid permission action: "${value}". Expected: ask, allow, or deny.`,
  );
}

/**
 * Mirrors parsePermissionBlock from src/opencode/parse-agent-md.ts.
 * @param {string[]} blockLines
 * @returns {AgentPermission}
 */
function parsePermissionBlock(blockLines) {
  if (blockLines.length === 0) {
    throw new Error("'permission:' block is empty");
  }

  const nonEmpty = blockLines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) {
    throw new Error("'permission:' block is empty");
  }
  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^( *)/)?.[0].length ?? 0),
  );
  const normalized = nonEmpty.map((l) => l.slice(minIndent));

  /** @type {AgentPermission} */
  const result = {};
  let i = 0;
  while (i < normalized.length) {
    const line = normalized[i];
    const topMatch = line.match(/^(\S+):\s*(.*)$/);
    if (!topMatch) {
      throw new Error(`Malformed permission entry: "${line}"`);
    }
    const key = topMatch[1];
    const inline = topMatch[2].trim();
    if (inline) {
      result[key] = validatePermissionAction(inline);
      i++;
    } else {
      /** @type {Record<string, PermissionAction>} */
      const subBlock = {};
      i++;
      while (i < normalized.length) {
        const subLine = normalized[i];
        if (!/^\s/.test(subLine)) break;
        const subMatch = subLine.match(/^ {2}(.+?):\s*(.+)$/);
        if (!subMatch) {
          throw new Error(`Malformed permission sub-entry: "${subLine}"`);
        }
        const rawSubKey = subMatch[1].trim();
        const subKey = rawSubKey
          .replace(/^"(.*)"$/, '$1')
          .replace(/^'(.*)'$/, '$1');
        subBlock[subKey] = validatePermissionAction(subMatch[2].trim());
        i++;
      }
      if (Object.keys(subBlock).length === 0) {
        throw new Error(`Empty sub-block for permission key "${key}"`);
      }
      result[key] = subBlock;
    }
  }
  return result;
}

/**
 * Parses frontmatter from a markdown file. Used for both agents and skills.
 * @param {string} raw - Raw file content
 * @param {string} filePath - File path for error messages
 * @returns {{ name: string, description: string, permission?: AgentPermission }}
 */
function parseMarkdownFrontmatter(raw, filePath) {
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
  /** @type {AgentPermission | undefined} */
  let permission;

  for (let i = 0; i < frontmatterLines.length; i++) {
    const line = frontmatterLines[i];

    const nameMatch = line.match(/^name:\s*(.+)$/);
    if (nameMatch) {
      name = nameMatch[1].trim();
      continue;
    }

    const descMatch = line.match(/^description:\s*(.+)$/);
    if (descMatch) {
      description = descMatch[1].trim();
      continue;
    }

    if (/^permission:\s*$/.test(line)) {
      /** @type {string[]} */
      const blockLines = [];
      let j = i + 1;
      while (j < frontmatterLines.length && /^\s/.test(frontmatterLines[j])) {
        blockLines.push(frontmatterLines[j]);
        j++;
      }
      permission = parsePermissionBlock(blockLines);
      i = j - 1;
      continue;
    }

    if (/^permission:\s+\S/.test(line)) {
      throw new Error(
        `${filePath}: Inline 'permission:' is not supported. Use a multi-line block:\npermission:\n  question: allow`,
      );
    }
  }

  if (!name) {
    throw new Error(`${filePath}: Frontmatter missing required "name" field`);
  }
  if (!description) {
    throw new Error(`${filePath}: Frontmatter missing required "description" field`);
  }

  return { name, description, permission };
}

/**
 * Extracts the `permission:` block from source, preserving original text.
 * @param {string} raw
 * @returns {string | null}
 */
function extractPermissionText(raw) {
  const lines = raw.split('\n');
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^permission:\s*$/.test(lines[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return null;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (!/^\s/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join('\n');
}

/**
 * Recursively finds all SKILL.md files in a directory
 * @param {string} dir
 * @returns {string[]}
 */
function findSkillFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const path = join(dir, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        results.push(...findSkillFiles(path));
      } else if (entry === 'SKILL.md') {
        results.push(path);
      }
    }
  } catch (err) {
    // Directory doesn't exist, return empty
  }
  return results;
}

const distContent = readFileSync('dist/index.js', 'utf-8');
let failed = false;

// Step 1: Verify rubber-duck agent (from agents/rubber-duck.agent.md)
console.log('\n=== Verifying Rubber Duck Agent ===');
try {
  const rubberDuckPath = 'agents/rubber-duck.agent.md';
  const raw = readFileSync(rubberDuckPath, 'utf-8');
  const meta = parseMarkdownFrontmatter(raw, rubberDuckPath);

  if (!distContent.includes(meta.name)) {
    console.error(
      `ERROR: Agent prompt not found in bundle: ${meta.name}`,
    );
    failed = true;
  } else {
    console.log(`✓ ${meta.name}`);
  }

  // Check permission
  if (!meta.permission || Object.keys(meta.permission).length === 0) {
    console.error(
      `ERROR: Frontmatter missing required "permission" field: ${rubberDuckPath}`,
    );
    failed = true;
  } else {
    const permText = extractPermissionText(raw);
    if (permText === null) {
      console.error(`ERROR: Parsed permission but could not locate block in source`);
      failed = true;
    } else {
      const escapedPermText = permText.replace(/\n/g, '\\n');
      if (!distContent.includes(escapedPermText)) {
        console.error(
          `ERROR: Agent permission not found in bundle: ${meta.name}`,
        );
        failed = true;
      } else {
        console.log(`✓ ${meta.name} permission in bundle`);
      }
    }
  }
} catch (err) {
  console.error(`ERROR: Failed to verify rubber-duck agent: ${err.message}`);
  failed = true;
}

// Step 2: Verify all skills in skills/ directory
console.log('\n=== Verifying Skills ===');
const skillFiles = findSkillFiles('skills').sort();

if (skillFiles.length === 0) {
  console.warn('WARNING: No SKILL.md files found in skills/ directory');
} else {
  for (const skillPath of skillFiles) {
    try {
      const raw = readFileSync(skillPath, 'utf-8');
      const meta = parseMarkdownFrontmatter(raw, skillPath);
      console.log(`✓ ${meta.name} (${skillPath})`);
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
      failed = true;
    }
  }
}

// Exit
if (failed) {
  console.log('\n❌ Verification failed');
  process.exit(1);
}

console.log(
  `\n✅ All verifications passed (rubber-duck agent + ${skillFiles.length} skills)`,
);
