/**
 * Verifies that every agents/*.agent.md file has its agent name embedded in dist/index.js.
 * Mirrors the parseAgentMd logic from src/opencode/parse-agent-md.ts so CI validation
 * uses the same frontmatter parsing rules as the runtime.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Mirrors parseAgentMd from src/opencode/parse-agent-md.ts.
 * @param {string} raw - Raw file content
 * @param {string} filePath - File path for error messages
 * @returns {{ name: string, description: string }}
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

  return { name, description };
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
    count++;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`All ${count} agent prompts verified in dist/index.js`);
