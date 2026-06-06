export type PermissionAction = "ask" | "allow" | "deny";

/**
 * Free-form per-agent permission map. Matches the OpenCode agent `permission`
 * config field. See https://opencode.ai/docs/agents/#permissions
 *
 * - Flat-only keys (question, todowrite, webfetch, websearch, doom_loop) take
 *   the string form.
 * - Pattern-bearing keys (bash, external_directory, edit, read, etc.) take the
 *   object form `{ pattern: action }`. The order of entries matters: OpenCode
 *   applies the LAST matching rule, so broad patterns come first.
 */
export type AgentPermission = Record<
  string,
  PermissionAction | Record<string, PermissionAction>
>;

export interface AgentMdMeta {
  name: string;
  description: string;
  permission?: AgentPermission;
  prompt: string;
}

/**
 * Parse a `permission:` block (the indented lines under the top-level
 * `permission:` key) into a structured AgentPermission map.
 *
 * Supports two shapes:
 *   permission:
 *     question: allow
 *     bash:
 *       "*": ask
 *       "git *": allow
 *
 * If the parser ever needs to handle more complex YAML (3+ levels of nesting,
 * anchors, multi-line scalars, etc.), swap this for a real YAML library. The
 * trigger is documented here so future contributors know where to look.
 */
function parsePermissionBlock(blockLines: string[]): AgentPermission {
  if (blockLines.length === 0) {
    throw new Error("'permission:' block is empty");
  }

  // Normalize indentation: strip the minimum common leading whitespace so
  // sub-block detection can rely on relative indent.
  const nonEmpty = blockLines.filter((l) => l.trim().length > 0);
  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^( *)/)?.[0].length ?? 0),
  );
  const normalized = nonEmpty.map((l) => l.slice(minIndent));

  const result: AgentPermission = {};
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
      // Sub-block: collect deeper-indented lines until we hit a top-level entry.
      const subBlock: Record<string, PermissionAction> = {};
      i++;
      while (i < normalized.length) {
        const subLine = normalized[i];
        if (!/^\s/.test(subLine)) break; // back at top level
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

function validatePermissionAction(value: string): PermissionAction {
  if (value === "ask" || value === "allow" || value === "deny") return value;
  throw new Error(
    `Invalid permission action: "${value}". Expected: ask, allow, or deny.`,
  );
}

export function parseAgentMd(raw: string): AgentMdMeta {
  const lines = raw.split("\n");

  if (lines[0]?.trim() !== "---") {
    throw new Error("Missing opening frontmatter fence (---)");
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    throw new Error("Missing closing frontmatter fence (---)");
  }

  const frontmatterLines = lines.slice(1, closingIndex);
  let name = "";
  let description = "";
  let permission: AgentPermission | undefined;

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
      // Collect indented block: lines with any leading whitespace after the
      // `permission:` key, up to the next non-indented line.
      const blockLines: string[] = [];
      let j = i + 1;
      while (j < frontmatterLines.length && /^\s/.test(frontmatterLines[j])) {
        blockLines.push(frontmatterLines[j]);
        j++;
      }
      permission = parsePermissionBlock(blockLines);
      i = j - 1; // skip past the block in the outer loop
      continue;
    }

    if (/^permission:\s+\S/.test(line)) {
      // Inline form like `permission: { question: allow }` is not supported.
      // The block form is the only one we parse.
      throw new Error(
        "Inline 'permission:' is not supported. Use a multi-line block:\npermission:\n  question: allow",
      );
    }
  }

  if (!name) {
    throw new Error('Frontmatter missing required "name" field');
  }
  if (!description) {
    throw new Error('Frontmatter missing required "description" field');
  }

  const prompt = lines.slice(closingIndex + 1).join("\n").trim();

  return { name, description, permission, prompt };
}
