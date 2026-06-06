/**
 * Verifies that every agents/*.agent.md file has its agent name embedded in dist/index.js,
 * AND that the `permission:` block from each frontmatter is also embedded in the bundle.
 *
 * Mirrors the parseAgentMd logic from src/opencode/parse-agent-md.ts so CI validation
 * uses the same frontmatter parsing rules as the runtime.
 */

import { readFileSync, readdirSync } from 'node:fs';
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
        const subMatch = subLine.match(/^ {2}(\S+):\s*(.+)$/);
        if (!subMatch) {
          throw new Error(`Malformed permission sub-entry: "${subLine}"`);
        }
        subBlock[subMatch[1]] = validatePermissionAction(subMatch[2].trim());
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
 * Mirrors parseAgentMd from src/opencode/parse-agent-md.ts.
 * @param {string} raw - Raw file content
 * @param {string} filePath - File path for error messages
 * @returns {{ name: string, description: string, permission?: AgentPermission }}
 */
function parseAgentMd(raw, filePath) {
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
 * Extracts the `permission:` block (top-level line + indented children) from
 * the source file's frontmatter, preserving its original text. Returns null
 * if the frontmatter has no `permission:` key.
 *
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

const distContent = readFileSync('dist/index.js', 'utf-8');
const agentFiles = readdirSync('agents')
  .filter((f) => f.endsWith('.agent.md'))
  .sort();

let count = 0;
let failed = false;

for (const filename of agentFiles) {
  const filePath = join('agents', filename);
  let meta;
  try {
    const raw = readFileSync(filePath, 'utf-8');
    meta = parseAgentMd(raw, filePath);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    failed = true;
    continue;
  }

  if (!distContent.includes(meta.name)) {
    console.error(
      `ERROR: Agent prompt not found in bundle: ${meta.name} (from ${filePath})`,
    );
    failed = true;
  } else {
    console.log(`OK: ${meta.name}`);
  }

  // Permission checks. Every agent is required to declare at least one
  // permission entry so the `question` tool (or any other required tool) is
  // guaranteed to be exposed regardless of OpenCode's defaults.
  if (!meta.permission || Object.keys(meta.permission).length === 0) {
    console.error(
      `ERROR: Frontmatter missing required "permission" field: ${filePath}`,
    );
    failed = true;
  } else {
    const permText = extractPermissionText(readFileSync(filePath, 'utf-8'));
    if (permText === null) {
      console.error(
        `ERROR: Parsed permission but could not locate block in source: ${filePath}`,
      );
      failed = true;
    } else {
      // tsup's text loader inlines the markdown as a JS string literal, so
      // the bundle stores newlines as the two-char escape sequence `\n`
      // rather than literal newlines. Convert before checking.
      const escapedPermText = permText.replace(/\n/g, '\\n');
      if (!distContent.includes(escapedPermText)) {
        console.error(
          `ERROR: Agent permission not found in bundle: ${meta.name} (from ${filePath})`,
        );
        failed = true;
      } else {
        console.log(`OK: ${meta.name} permission in bundle`);
        count++;
      }
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`All ${count} agent prompts verified in dist/index.js`);
