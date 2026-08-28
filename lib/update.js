import { readFile, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gt, valid, validRange } from 'semver';

const packageName = '@marcelorodrigo/opencode-development-crew';

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
  removeDirectory: async (directory) => rm(directory, { recursive: true, force: true }),
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
              message: `Updated ${result.name} from ${result.current} to ${result.latest}. Restart OpenCode to finish.`,
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
 * Check for a newer npm release and invalidate the eligible OpenCode wrapper.
 * @param {AbortSignal} signal Request cancellation signal.
 * @param {object} dependencies Injectable filesystem, registry, and removal functions.
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

  const removeDirectory = await dependencies.updateRemoveDirectory(
    packageDirectory,
    packageJson.name,
    undefined,
  );
  if (!removeDirectory) return { updated: false };

  try {
    await dependencies.removeDirectory(removeDirectory);
  } catch {
    return {
      updated: false,
      error: 'remove_failed',
      name: packageJson.name,
      current: packageJson.version,
      latest,
    };
  }

  return {
    updated: true,
    name: packageJson.name,
    current: packageJson.version,
    latest,
  };
}

/**
 * Return the OpenCode wrapper eligible for removal, or undefined.
 * @param {string} packageDirectory Installed package directory.
 * @param {string} name Package name.
 * @param {string|undefined} openCodePackagesDirectory OpenCode cache directory.
 * @param {string|undefined} latest Latest registry version, when known.
 * @returns {Promise<string|undefined>} Validated wrapper directory.
 */
export async function updateRemoveDirectory(
  packageDirectory,
  name,
  openCodePackagesDirectory = getOpenCodePackagesDirectory(),
  latest,
) {
  const packageParent = dirname(packageDirectory);
  const nodeModulesDirectory = basename(packageParent).startsWith('@')
    ? dirname(packageParent)
    : packageParent;

  if (basename(nodeModulesDirectory) !== 'node_modules') return undefined;

  const wrapperDirectory = dirname(nodeModulesDirectory);
  if (!openCodePackagesDirectory || !isOpenCodeWrapper(wrapperDirectory, name, openCodePackagesDirectory)) {
    return undefined;
  }

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

function getOpenCodePackagesDirectory() {
  const cacheDirectory = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
  return join(cacheDirectory, 'opencode', 'packages');
}

function isOpenCodeWrapper(wrapperDirectory, name, openCodePackagesDirectory) {
  const [scope] = name.split('/');
  const parentDirectory = name.startsWith('@')
    ? scope
      ? join(openCodePackagesDirectory, scope)
      : undefined
    : openCodePackagesDirectory;

  return parentDirectory !== undefined && resolve(dirname(wrapperDirectory)) === resolve(parentDirectory);
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
