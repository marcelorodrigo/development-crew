import { cp, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const runtimeRoots = new Set();
let cleanupRegistered = false;

function registerRuntimeRoot(runtimeRoot) {
  runtimeRoots.add(runtimeRoot);
  if (cleanupRegistered) return;

  cleanupRegistered = true;
  process.once('exit', () => {
    for (const root of runtimeRoots) {
      try {
        rmSync(root, { recursive: true, force: true });
      } catch {
        // Runtime cleanup is best effort and must not affect process shutdown.
      }
    }
  });
}

/**
 * Copy package assets out of the mutable package wrapper before an update can run.
 * @param {string} sourceSkillsDir Package skills directory.
 * @param {string} bootstrapRelativePath Bootstrap skill path relative to skills.
 * @returns {Promise<{skillsDir: string, bootstrapContent: string|null}>}
 */
export async function prepareRuntimeAssets(sourceSkillsDir, bootstrapRelativePath) {
  const runtimeRoot = await mkdtemp(join(tmpdir(), 'development-crew-'));
  registerRuntimeRoot(runtimeRoot);
  const stagingDir = join(runtimeRoot, 'skills.staging');
  const snapshotDir = join(runtimeRoot, 'skills');

  try {
    await cp(sourceSkillsDir, stagingDir, { recursive: true, force: false });
    await rename(stagingDir, snapshotDir);

    let bootstrapContent = null;
    try {
      bootstrapContent = await readFile(join(snapshotDir, bootstrapRelativePath), 'utf8');
    } catch {
      // Preserve the existing no-bootstrap behavior when the skill is absent.
    }

    return { skillsDir: snapshotDir, bootstrapContent };
  } catch (error) {
    await rm(runtimeRoot, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}
