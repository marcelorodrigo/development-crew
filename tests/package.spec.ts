import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const expectedFiles = [
  'hooks/hooks-cursor.json',
  'hooks/hooks.json',
  'hooks/omp-session-start.ts',
  'hooks/run-hook.cmd',
  'hooks/session-start',
  'index.js',
  'LICENSE',
  'lib/development-crew.js',
  'lib/skills.js',
  'package.json',
  'OPENCODE_INSTALL.md',
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
      expect(packageJson.main).toBe('./index.js');
      expect(packageJson.exports['.']).toBe(packageJson.main);
      expect(packageJson.engines.node).toBe('>=24');
      expect(metadata.files.map(({ path }: { path: string }) => path).sort()).toEqual([...expectedFiles].sort());

      execFileSync('tar', ['-xzf', metadata.filename, '-C', directory]);
      const installedEntry = join(directory, 'package', 'index.js');
      expect(existsSync(installedEntry)).toBe(true);

      const installedDirectory = join(directory, 'package');
      copyFileSync(join(root, 'pnpm-lock.yaml'), join(installedDirectory, 'pnpm-lock.yaml'));
      copyFileSync(join(root, 'pnpm-workspace.yaml'), join(installedDirectory, 'pnpm-workspace.yaml'));
      execFileSync('pnpm', ['install', '--frozen-lockfile', '--offline', '--prod', '--ignore-scripts'], {
        cwd: installedDirectory,
        stdio: 'inherit',
      });
      const result = execFileSync(process.execPath, ['--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import { existsSync } from 'node:fs';
        import { Skill } from '@opencode/plugin';
        const entry = await import('./index.js');
        assert.deepEqual(Object.keys(entry), ['default']);
        assert.equal(entry.default.id, 'development-crew');
        const skills = [];
        const hooks = [];
        await entry.default.setup({
          skill: { transform: async (callback) => callback({ add: (skill) => skills.push(skill) }) },
          session: { hook: async (name, callback) => hooks.push([name, callback]) },
        });
        assert.equal(skills.length, 6);
        for (const skill of skills) {
          assert.ok(Skill.Info.make(skill));
          assert.ok(existsSync(skill.path));
          assert.ok(skill.path.startsWith(process.cwd()));
        }
        assert.equal(hooks[0][0], 'context');
        const event = { system: [], messages: [] };
        await hooks[0][1](event);
        assert.ok(event.system[0].text.includes('<!-- development-crew-bootstrap -->'));
        console.log('Packaged v2 plugin verified');
      `], { cwd: installedDirectory, encoding: 'utf8' });
      expect(result).toContain('Packaged v2 plugin verified');
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  }, 30_000);
});
