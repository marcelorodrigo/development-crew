import { mkdir, mkdtemp, readFile, rm, stat, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  acquireLock,
  checkAutoUpdate,
  isAutoUpdatableSpecification,
  isVersionNewer,
  startAutoUpdate,
  updateRemoveDirectory,
} from '../lib/update.js';

const packageName = '@marcelorodrigo/opencode-development-crew';

describe('isVersionNewer', () => {
  it('compares release versions and prereleases', () => {
    expect(isVersionNewer('0.16.0', '0.15.0')).toBe(true);
    expect(isVersionNewer('0.15.0', '0.15.0')).toBe(false);
    expect(isVersionNewer('0.15.0', '0.16.0')).toBe(false);
    expect(isVersionNewer('0.15.0', '0.15.0-beta.1')).toBe(true);
    expect(isVersionNewer('not-a-version', '0.15.0')).toBe(false);
  });
});

describe('isAutoUpdatableSpecification', () => {
  it.each(['latest', '*', '^0.15.0', '~0.15.0', '>=0.15.0', '0.x'])('%s is eligible', (specification) => {
    expect(isAutoUpdatableSpecification(specification)).toBe(true);
  });

  it.each(['0.15.0', 'file:../plugin', 'github:owner/plugin', '', 'not a range', null])('%s is not eligible', (specification) => {
    expect(isAutoUpdatableSpecification(specification)).toBe(false);
  });
});

describe('updateRemoveDirectory', () => {
  const cacheDirectory = '/tmp/opencode-cache/opencode/packages';

  it('selects a scoped floating-version OpenCode wrapper', async () => {
    const wrapper = `${cacheDirectory}/@marcelorodrigo/opencode-development-crew@latest`;
    const packageDirectory = `${wrapper}/node_modules/${packageName}`;

    await expect(updateRemoveDirectory(packageDirectory, packageName, cacheDirectory)).resolves.toBe(wrapper);
  });

  it('rejects pinned and outside-cache wrappers', async () => {
    const pinned = `${cacheDirectory}/@marcelorodrigo/opencode-development-crew@0.15.0/node_modules/${packageName}`;
    const outside = `/tmp/opencode-development-crew@latest/node_modules/${packageName}`;

    await expect(updateRemoveDirectory(pinned, packageName, cacheDirectory)).resolves.toBeUndefined();
    await expect(updateRemoveDirectory(outside, packageName, cacheDirectory)).resolves.toBeUndefined();
  });

  it('rejects a project packages directory when no OpenCode root is supplied', async () => {
    const projectWrapper = `/tmp/project/packages/@marcelorodrigo/opencode-development-crew@latest/node_modules/${packageName}`;
    const opencodeShapedProjectWrapper = `/tmp/project/opencode/packages/@marcelorodrigo/opencode-development-crew@latest/node_modules/${packageName}`;

    await expect(updateRemoveDirectory(projectWrapper, packageName)).resolves.toBeUndefined();
    await expect(updateRemoveDirectory(opencodeShapedProjectWrapper, packageName)).resolves.toBeUndefined();
  });
});

describe('checkAutoUpdate', () => {
  it('reifies an eligible wrapper when npm has a newer version', async () => {
    const reifyPackage = vi.fn();
    const readPackageJson = vi.fn()
      .mockResolvedValueOnce({ name: packageName, version: '0.15.0' })
      .mockResolvedValueOnce({ name: packageName, version: '0.15.0' })
      .mockResolvedValueOnce({ name: packageName, version: '0.16.0' });
    const wrapper = '/cache/@marcelorodrigo/opencode-development-crew@latest';
    const result = await checkAutoUpdate(new AbortController().signal, {
      findPackageDirectory: vi.fn().mockResolvedValue(`${wrapper}/node_modules/${packageName}`),
      readPackageJson,
      fetchLatestVersion: vi.fn().mockResolvedValue('0.16.0'),
      updateRemoveDirectory: vi.fn().mockResolvedValue(wrapper),
      reifyPackage,
      acquireLock: vi.fn().mockResolvedValue(vi.fn()),
    });

    expect(result).toEqual({ updated: true, name: packageName, current: '0.15.0', latest: '0.16.0' });
    expect(reifyPackage).toHaveBeenCalledWith(wrapper, packageName, '0.16.0');
  });

  it('does not reify the wrapper when the installed version is current', async () => {
    const reifyPackage = vi.fn();
    const result = await checkAutoUpdate(new AbortController().signal, {
      findPackageDirectory: vi.fn().mockResolvedValue('/cache/package'),
      readPackageJson: vi.fn().mockResolvedValue({ name: packageName, version: '0.15.0' }),
      fetchLatestVersion: vi.fn().mockResolvedValue('0.15.0'),
      updateRemoveDirectory: vi.fn(),
      reifyPackage,
      acquireLock: vi.fn(),
    });

    expect(result).toEqual({ updated: false });
    expect(reifyPackage).not.toHaveBeenCalled();
  });

  it('reports reification failures without claiming an update', async () => {
    const result = await checkAutoUpdate(new AbortController().signal, {
      findPackageDirectory: vi.fn().mockResolvedValue('/cache/package'),
      readPackageJson: vi.fn().mockResolvedValue({ name: packageName, version: '0.15.0' }),
      fetchLatestVersion: vi.fn().mockResolvedValue('0.16.0'),
      updateRemoveDirectory: vi.fn().mockResolvedValue('/cache/wrapper'),
      reifyPackage: vi.fn().mockRejectedValue(new Error('permission denied')),
      acquireLock: vi.fn().mockResolvedValue(vi.fn()),
    });

    expect(result).toEqual({
      updated: false,
      error: 'reify_failed',
      name: packageName,
      current: '0.15.0',
      latest: '0.16.0',
    });
  });

  it('deduplicates concurrent updates and releases the lock', async () => {
    let verify;
    const release = vi.fn();
    const reifyPackage = vi.fn().mockImplementation(() => new Promise((resolve) => { verify = resolve; }));
    const readPackageJson = vi.fn()
      .mockResolvedValueOnce({ name: packageName, version: '0.15.0' })
      .mockResolvedValueOnce({ name: packageName, version: '0.15.0' })
      .mockResolvedValueOnce({ name: packageName, version: '0.15.0' })
      .mockResolvedValue({ name: packageName, version: '0.16.0' });
    const dependencies = {
      findPackageDirectory: vi.fn().mockResolvedValue('/cache/wrapper/node_modules/@marcelorodrigo/opencode-development-crew'),
      readPackageJson,
      fetchLatestVersion: vi.fn().mockResolvedValue('0.16.0'),
      updateRemoveDirectory: vi.fn().mockResolvedValue('/cache/wrapper'),
      reifyPackage,
      acquireLock: vi.fn().mockResolvedValue(release),
    };
    const first = checkAutoUpdate(new AbortController().signal, dependencies);
    const second = checkAutoUpdate(new AbortController().signal, dependencies);
    await vi.waitFor(() => expect(reifyPackage).toHaveBeenCalledOnce());
    verify();
    await expect(Promise.all([first, second])).resolves.toEqual([
      { updated: true, name: packageName, current: '0.15.0', latest: '0.16.0' },
      { updated: true, name: packageName, current: '0.15.0', latest: '0.16.0' },
    ]);
    expect(release).toHaveBeenCalledOnce();
  });
});

describe('acquireLock', () => {
  it('recovers a stale lock created before its heartbeat', async () => {
    const root = await mkdtemp(join(tmpdir(), 'development-crew-lock-'));
    const wrapper = join(root, 'wrapper');
    const lock = `${wrapper}.development-crew-update.lock`;

    try {
      await mkdir(lock);
      const stale = new Date(Date.now() - 120_000);
      await utimes(lock, stale, stale);

      const release = await acquireLock(wrapper);
      await expect(stat(lock)).resolves.toBeDefined();
      await release();
      await expect(stat(lock)).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not let an old owner release a replacement lock', async () => {
    const root = await mkdtemp(join(tmpdir(), 'development-crew-lock-'));
    const wrapper = join(root, 'wrapper');
    const lock = `${wrapper}.development-crew-update.lock`;

    try {
      const releaseOld = await acquireLock(wrapper);
      const stale = new Date(Date.now() - 120_000);
      await utimes(join(lock, 'heartbeat'), stale, stale);
      const releaseNew = await acquireLock(wrapper);

      await releaseOld();
      await expect(readFile(join(lock, 'owner'), 'utf8')).resolves.toHaveLength(36);
      await releaseNew();
      await expect(stat(lock)).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe('startAutoUpdate', () => {
  it('aborts after ten seconds and shows a delayed update toast', async () => {
    const scheduled: Array<{ callback: () => void; delay: number }> = [];
    const showToast = vi.fn();
    const input = { client: { tui: { showToast } } };

    startAutoUpdate(input, {
      check: vi.fn().mockResolvedValue({ updated: true, name: packageName, current: '0.15.0', latest: '0.16.0' }),
      schedule: (callback, delay) => {
        scheduled.push({ callback, delay });
        return scheduled.length;
      },
      cancel: vi.fn(),
    });

    await vi.waitFor(() => expect(scheduled).toHaveLength(2));

    expect(scheduled.map(({ delay }) => delay)).toEqual([10_000, 5_000]);
    expect(showToast).not.toHaveBeenCalled();

    scheduled[1].callback();

    expect(showToast).toHaveBeenCalledWith({
      body: {
        title: 'Development Crew update ready',
        message: `Installed ${packageName} 0.16.0 (from 0.15.0). Restart OpenCode to finish.`,
        variant: 'info',
        duration: 7000,
      },
    });
  });

  it('suppresses notification failures', async () => {
    const schedule = vi.fn((callback: () => void) => {
      if (schedule.mock.calls.length === 2) callback();
      return 1;
    });

    expect(() => startAutoUpdate({ client: { tui: { showToast: () => { throw new Error('closed'); } } } }, {
      check: vi.fn().mockResolvedValue({ updated: true, name: packageName, current: '0.15.0', latest: '0.16.0' }),
      schedule,
      cancel: vi.fn(),
    })).not.toThrow();

    await Promise.resolve();
    await Promise.resolve();
  });

  it('suppresses synchronous updater failures', async () => {
    const cancel = vi.fn();

    expect(() => startAutoUpdate({}, {
      check: () => {
        throw new Error('unexpected failure');
      },
      schedule: vi.fn(() => 1),
      cancel,
    })).not.toThrow();

    await vi.waitFor(() => expect(cancel).toHaveBeenCalledOnce());

    expect(cancel).toHaveBeenCalledOnce();
  });
});
