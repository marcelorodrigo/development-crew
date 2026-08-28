import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const expectedFiles = [
  '.opencode/plugins/development-crew.js',
  '.opencode/plugins/update.js',
  'hooks/hooks-cursor.json',
  'hooks/hooks.json',
  'hooks/omp-session-start.ts',
  'hooks/run-hook.cmd',
  'hooks/session-start',
  'LICENSE',
  'package.json',
  'README.md',
  'skills/architect/SKILL.md',
  'skills/code-reviewer/SKILL.md',
  'skills/implementer/SKILL.md',
  'skills/rubber-duck/SKILL.md',
  'skills/shared-principles/SKILL.md',
  'skills/using-development-crew/SKILL.md',
];

describe('npm package', () => {
  it('contains the complete runtime artifact and no development files', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'development-crew-package-'));

    try {
      const output = execFileSync('pnpm', ['pack', '--json', '--pack-destination', directory], {
        cwd: root,
        encoding: 'utf8',
      });
      const metadata = JSON.parse(output);
      const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

      expect(metadata.name).toBe('@marcelorodrigo/opencode-development-crew');
      expect(metadata.version).toBe('0.15.0');
      expect(packageJson.main).toBe('./.opencode/plugins/development-crew.js');
      expect(packageJson.exports['.']).toBe(packageJson.main);
      expect(packageJson.engines.node).toBe('>=24');
      expect(metadata.files.map(({ path }: { path: string }) => path).sort()).toEqual([...expectedFiles].sort());

      const extractDirectory = join(directory, 'extract');
      execFileSync('tar', ['-xzf', metadata.filename, '-C', directory]);
      const installedEntry = join(directory, 'package', '.opencode/plugins/development-crew.js');
      expect(existsSync(installedEntry)).toBe(true);

      const packaged = await import(pathToFileURL(installedEntry).href);
      const plugin = packaged.createDevelopmentCrewPlugin(() => {});
      const hooks = await plugin({});
      const config: Record<string, unknown> = {};
      await hooks.config(config);
      expect(config.skills).toBeDefined();
      expect(existsSync(join(directory, 'package', 'skills', 'using-development-crew', 'SKILL.md'))).toBe(true);
      rmSync(extractDirectory, { force: true, recursive: true });
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});
