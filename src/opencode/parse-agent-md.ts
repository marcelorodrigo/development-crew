export interface AgentMdMeta {
  name: string;
  description: string;
  prompt: string;
}

export function parseAgentMd(raw: string): AgentMdMeta {
  const lines = raw.split('\n');

  if (lines[0]?.trim() !== '---') {
    throw new Error('Missing opening frontmatter fence (---)');
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    throw new Error('Missing closing frontmatter fence (---)');
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
    throw new Error('Frontmatter missing required "name" field');
  }
  if (!description) {
    throw new Error('Frontmatter missing required "description" field');
  }

  const prompt = lines.slice(closingIndex + 1).join('\n').trim();

  return { name, description, prompt };
}
