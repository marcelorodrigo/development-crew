import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSkills, parseSkill } from '../lib/skills.js';

describe('packaged skill loader', () => {
  it('parses quoted metadata and normalizes CRLF', () => {
    const skill = parseSkill('---\r\nname: "test"\r\ndescription: \'Test: skill\'\r\n---\r\n# Instructions\r\n', 'test', '/skills/test/SKILL.md');
    expect(skill).toEqual({
      id: 'test', name: 'test', description: 'Test: skill', path: '/skills/test/SKILL.md', content: '# Instructions\n',
    });
  });

  it.each([
    '# No frontmatter',
    '---\nname: wrong\ndescription: Test\n---\nBody',
    '---\nname: test\n---\nBody',
    '---\nname: test\ndescription: ""\n---\nBody',
  ])('rejects malformed skill metadata with the file path', (raw) => {
    expect(() => parseSkill(raw, 'test', '/skills/test/SKILL.md')).toThrow(/Invalid Development Crew skill \/skills\/test\/SKILL.md/);
  });

  it('identifies an unreadable skill and preserves the filesystem cause', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'development-crew-skills-'));
    try {
      await mkdir(join(directory, 'missing'));
      await writeFile(join(directory, 'README.md'), 'Ignored');
      await expect(loadSkills(directory)).rejects.toMatchObject({
        message: `Cannot read Development Crew skill ${join(directory, 'missing', 'SKILL.md')}`,
        cause: { code: 'ENOENT' },
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
