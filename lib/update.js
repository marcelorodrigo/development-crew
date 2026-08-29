import { mkdir, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gt, valid, validRange } from 'semver';

const packageName = '@marcelorodrigo/opencode-development-crew';
const updateFlights = new Map();

const defaultAutoUpdateDependencies = {
  check: checkAutoUpdate,
  schedule: setTimeout,
  cancel: clearTimeout,
};

const defaultUpdateCheckDependencies = {
  findPackageDirectory,
  readPackageJson,
  fetchLatestVersion,
  updateRemoveDirectory,
  reifyPackage,
  acquireLock,
};

/**
 * Start the optional update check without delaying plugin initialization.
 * @param {object} input OpenCode plugin input.
 * @param {object} dependencies Injectable check and timer functions.
 */
export function startAutoUpdate(input, dependencies = defaultAutoUpdateDependencies) {
  const controller = new AbortController();
  const timeout = dependencies.schedule(() => controller.abort(), 10_000);

  void Promise.resolve()
    .then(() => dependencies.check(controller.signal))
    .then((result) => {
      if (!result.updated) return;

      dependencies.schedule(() => {
        try {
          const toast = input.client.tui.showToast({
            body: {
              title: 'Development Crew update ready',
              message: `Installed ${result.name} ${result.latest} (from ${result.current}). Restart OpenCode to finish.`,
              variant: 'info',
              duration: 7000,
            },
          });
          void Promise.resolve(toast).catch(() => {});
        } catch {
          // Optional notifications must never disrupt OpenCode startup.
        }
      }, 5000);
    })
    .catch(() => {})
    .finally(() => dependencies.cancel(timeout));
}

/**
 * Check for a newer npm release and safely reify it into the eligible wrapper.
 * @param {AbortSignal} signal Request cancellation signal.
 * @param {object} dependencies Injectable filesystem, registry, and reification functions.
 * @returns {Promise<object>} Update result.
 */
export async function checkAutoUpdate(signal, dependencies = defaultUpdateCheckDependencies) {
  const packageDirectory = await dependencies.findPackageDirectory(packageName);
  if (!packageDirectory) return { updated: false };

  const packageJson = await dependencies.readPackageJson(join(packageDirectory, 'package.json'));
  if (!packageJson?.name || !packageJson.version) return { updated: false };

  const latest = await dependencies.fetchLatestVersion(packageJson.name, signal);
  if (!latest || !isVersionNewer(latest, packageJson.version)) {
    return { updated: false };
  }

  const wrapperDirectory = await dependencies.updateRemoveDirectory(
    packageDirectory,
    packageJson.name,
    undefined,
  );
  if (!wrapperDirectory) return { updated: false, error: 'wrapper_not_found' };

  const flightKey = `${wrapperDirectory}\0${packageJson.name}`;
  const existingFlight = updateFlights.get(flightKey);
  if (existingFlight) return existingFlight;

  const flight = updateWithLock(wrapperDirectory, packageJson.name, packageJson.version, latest, dependencies);
  updateFlights.set(flightKey, flight);
  try { return await flight; } finally { updateFlights.delete(flightKey); }
}

async function updateWithLock(wrapperDirectory, name, current, latest, dependencies) {
  let release;
  try {
    release = await dependencies.acquireLock(wrapperDirectory);
    const installed = await dependencies.readPackageJson(join(wrapperDirectory, 'node_modules', name, 'package.json'));
    if (installed?.version && !isVersionNewer(latest, installed.version)) return { updated: false };

    await dependencies.reifyPackage(wrapperDirectory, name, latest);
    const verified = await dependencies.readPackageJson(join(wrapperDirectory, 'node_modules', name, 'package.json'));
    if (verified?.name !== name || verified.version !== latest) {
      return { updated: false, error: 'version_verification_failed', name, current, latest };
    }
  } catch {
    return { updated: false, error: 'reify_failed', name, current, latest };
  } finally {
    try {
      await release?.();
    } catch {
      // Lock cleanup must never make a completed update fatal.
    }
  }

  return {
    updated: true,
    name,
    current,
    latest,
  };
}

async function reifyPackage(wrapperDirectory, name, latest) {
  const { Arborist } = await import('@npmcli/arborist');
  const arborist = new Arborist({
    path: wrapperDirectory,
    ignoreScripts: true,
    production: true,
    savePrefix: '',
  });
  await arborist.reify({
    add: [`${name}@${latest}`],
    save: false,
    ignoreScripts: true,
    omit: ['dev'],
  });
}

export async function acquireLock(wrapperDirectory) {
  const lockDirectory = `${wrapperDirectory}.development-crew-update.lock`;
  const breakerDirectory = `${lockDirectory}.breaker`;
  const ownerPath = join(lockDirectory, 'owner');
  const heartbeatPath = join(lockDirectory, 'heartbeat');
  const token = randomUUID();
  const deadline = Date.now() + 30_000;

  for (;;) {
    let created = false;
    try {
      await mkdir(lockDirectory);
      created = true;
      await writeFile(ownerPath, token, { encoding: 'utf8', flag: 'wx' });
      await writeFile(heartbeatPath, '', { flag: 'wx' });

      const heartbeat = setInterval(() => {
        const now = new Date();
        void utimes(heartbeatPath, now, now).catch(() => {});
      }, 10_000);
      heartbeat.unref?.();

      return async () => {
        clearInterval(heartbeat);
        let owner;
        try {
          owner = (await readFile(ownerPath, 'utf8')).trim();
        } catch {
          return;
        }
        if (owner === token) await rm(lockDirectory, { recursive: true, force: true });
      };
    } catch (error) {
      if (created) await rm(lockDirectory, { recursive: true, force: true }).catch(() => {});
      if (error?.code !== 'EEXIST') throw error;

      if (await breakStaleLock(lockDirectory, breakerDirectory)) continue;
      if (Date.now() >= deadline) throw new Error('update lock timeout');
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

async function breakStaleLock(lockDirectory, breakerDirectory) {
  try {
    await mkdir(breakerDirectory);
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;

    try {
      const breaker = await stat(breakerDirectory);
      if (Date.now() - breaker.mtimeMs > 60_000) {
        await rm(breakerDirectory, { recursive: true, force: true });
      }
    } catch {
      // Another contender may have removed the stale breaker.
    }
    return false;
  }

  try {
    const heartbeatPath = join(lockDirectory, 'heartbeat');
    const details = await stat(heartbeatPath).catch(() => stat(lockDirectory).catch(() => undefined));

    if (!details) return false;
    if (Date.now() - details.mtimeMs <= 60_000) return false;
    await rm(lockDirectory, { recursive: true, force: true });
    return true;
  } finally {
    await rm(breakerDirectory, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Return the OpenCode wrapper eligible for reification, or undefined.
 * @param {string} packageDirectory Installed package directory.
 * @param {string} name Package name.
 * @param {string|undefined} openCodePackagesDirectory OpenCode cache directory.
 * @returns {Promise<string|undefined>} Validated wrapper directory.
 */
export async function updateRemoveDirectory(
  packageDirectory,
  name,
  openCodePackagesDirectory = getOpenCodePackagesDirectory(),
) {
  const packageParent = dirname(packageDirectory);
  const nodeModulesDirectory = name.startsWith('@') ? dirname(packageParent) : packageParent;
  if (basename(nodeModulesDirectory) !== 'node_modules') return undefined;
  if (resolve(packageDirectory) !== resolve(join(dirname(nodeModulesDirectory), 'node_modules', name))) return undefined;
  const wrapperDirectory = dirname(nodeModulesDirectory);
  if (!isOpenCodeWrapper(wrapperDirectory, name, openCodePackagesDirectory)) return undefined;

  const specification = getWrapperSpecification(wrapperDirectory, name);
  if (!specification || !isAutoUpdatableSpecification(specification)) return undefined;

  return wrapperDirectory;
}

export function isAutoUpdatableSpecification(specification) {
  if (typeof specification !== 'string') return false;
  const value = specification.trim();
  if (!value) return false;
  if (value === 'latest' || value === '*') return true;
  return valid(value) === null && validRange(value) !== null;
}

export function isVersionNewer(latest, current) {
  try {
    if (!valid(latest) || !valid(current)) return false;
    return gt(latest, current);
  } catch {
    return false;
  }
}

async function findPackageDirectory(name) {
  let directory = dirname(fileURLToPath(import.meta.url));

  for (;;) {
    const packageJson = await readPackageJson(join(directory, 'package.json'));
    if (packageJson?.name === name) return directory;

    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

function isOpenCodeWrapper(wrapperDirectory, name, openCodePackagesDirectory) {
  const [scope] = name.split('/');
  if (!openCodePackagesDirectory || (name.startsWith('@') && !scope)) return false;

  const expectedParent = resolve(
    name.startsWith('@') ? join(openCodePackagesDirectory, scope) : openCodePackagesDirectory,
  );
  return resolve(dirname(wrapperDirectory)) === expectedParent;
}

function getOpenCodePackagesDirectory() {
  const cacheDirectory = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
  return join(cacheDirectory, 'opencode', 'packages');
}

function getWrapperSpecification(wrapperDirectory, name) {
  if (name.startsWith('@')) {
    const [scope, packagePart] = name.split('/');
    if (!scope || !packagePart || basename(dirname(wrapperDirectory)) !== scope) return undefined;

    const prefix = `${packagePart}@`;
    const wrapperName = basename(wrapperDirectory);
    return wrapperName.startsWith(prefix) ? wrapperName.slice(prefix.length) : undefined;
  }

  const prefix = `${name}@`;
  const wrapperName = basename(wrapperDirectory);
  return wrapperName.startsWith(prefix) ? wrapperName.slice(prefix.length) : undefined;
}

async function readPackageJson(path) {
  try {
    const data = JSON.parse(await readFile(path, 'utf8'));
    return data && typeof data === 'object' ? data : undefined;
  } catch {
    return undefined;
  }
}

async function fetchLatestVersion(name, signal) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, { signal });
    if (!response.ok) return undefined;

    const data = await response.json();
    return data && typeof data === 'object' && typeof data.version === 'string' ? data.version : undefined;
  } catch {
    return undefined;
  }
}
