import { describe, expect, it, vi } from 'vitest';
import {
  checkAutoUpdate,
  isAutoUpdatableSpecification,
  isVersionNewer,
  startAutoUpdate,
  updateRemoveDirectory,
} from '../.opencode/plugins/update.js';

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
});

describe('checkAutoUpdate', () => {
  it('removes an eligible wrapper when npm has a newer version', async () => {
    const removeDirectory = vi.fn();
    const wrapper = '/cache/@marcelorodrigo/opencode-development-crew@latest';
    const result = await checkAutoUpdate(new AbortController().signal, {
      findPackageDirectory: vi.fn().mockResolvedValue(`${wrapper}/node_modules/${packageName}`),
      readPackageJson: vi.fn().mockResolvedValue({ name: packageName, version: '0.15.0' }),
      fetchLatestVersion: vi.fn().mockResolvedValue('0.16.0'),
      updateRemoveDirectory: vi.fn().mockResolvedValue(wrapper),
      removeDirectory,
    });

    expect(result).toEqual({ updated: true, name: packageName, current: '0.15.0', latest: '0.16.0' });
    expect(removeDirectory).toHaveBeenCalledWith(wrapper);
  });

  it('does not remove the wrapper when the installed version is current', async () => {
    const removeDirectory = vi.fn();
    const result = await checkAutoUpdate(new AbortController().signal, {
      findPackageDirectory: vi.fn().mockResolvedValue('/cache/package'),
      readPackageJson: vi.fn().mockResolvedValue({ name: packageName, version: '0.15.0' }),
      fetchLatestVersion: vi.fn().mockResolvedValue('0.15.0'),
      updateRemoveDirectory: vi.fn(),
      removeDirectory,
    });

    expect(result).toEqual({ updated: false });
    expect(removeDirectory).not.toHaveBeenCalled();
  });

  it('reports wrapper removal failures without claiming an update', async () => {
    const result = await checkAutoUpdate(new AbortController().signal, {
      findPackageDirectory: vi.fn().mockResolvedValue('/cache/package'),
      readPackageJson: vi.fn().mockResolvedValue({ name: packageName, version: '0.15.0' }),
      fetchLatestVersion: vi.fn().mockResolvedValue('0.16.0'),
      updateRemoveDirectory: vi.fn().mockResolvedValue('/cache/wrapper'),
      removeDirectory: vi.fn().mockRejectedValue(new Error('permission denied')),
    });

    expect(result).toEqual({
      updated: false,
      error: 'remove_failed',
      name: packageName,
      current: '0.15.0',
      latest: '0.16.0',
    });
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
        message: `Updated ${packageName} from 0.15.0 to 0.16.0. Restart OpenCode to finish.`,
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
