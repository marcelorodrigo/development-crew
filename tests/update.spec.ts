import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAutoUpdater, getUpdateTarget, runNativeUpdate } from '../lib/update.js';

const packageName = '@marcelorodrigo/opencode-development-crew';
const target = `${packageName}@latest`;
const cooldown = 60 * 60 * 1000;

function mockContext(source: any = { type: 'package', target }, stored = new Map<string, any>()) {
  return {
    options: {} as { autoUpdate?: boolean },
    location: { directory: '/workspace/project' },
    plugin: {
      list: vi.fn(async () => ({ data: [
        { id: 'another-plugin', source: { type: 'package', target: 'another-plugin@latest' } },
        { id: 'development-crew', source },
      ] })),
    },
    storage: {
      get: vi.fn(async (key: string) => stored.get(key)),
      set: vi.fn(async (key: string, value: any) => { stored.set(key, value); }),
    },
  };
}

describe('automatic update eligibility', () => {
  it.each(['', '@latest', '@*', '@^1.0.0', '@~1.2.0', '@>=1.0.0 <2.0.0', '@1.x'])(
    'accepts the configured npm target %s', (suffix) => {
      expect(getUpdateTarget({ id: 'development-crew', source: { type: 'package', target: `${packageName}${suffix}` } }))
        .toBe(`${packageName}${suffix}`);
    },
  );

  it.each([
    '@1.2.3', '@v1.2.3', '@=1.2.3', '@1.2.3-beta.1', '@beta', '@', '@ ',
    '@npm:another-plugin', '@latest; echo unsafe',
  ])('skips exact pins and unsupported specifications: %s', (suffix) => {
    expect(getUpdateTarget({ id: 'development-crew', source: { type: 'package', target: `${packageName}${suffix}` } }))
      .toBeUndefined();
  });

  it.each([
    { id: 'development-crew', source: { type: 'local', path: '/checkout/index.js' } },
    { id: 'development-crew', source: { type: 'builtin' } },
    { id: 'another-plugin', source: { type: 'package', target } },
    { id: 'development-crew', source: { type: 'package', target: 'another-plugin@latest' } },
    { id: 'development-crew', source: { type: 'package', target: `${packageName}-other@latest` } },
    { id: 'development-crew', source: { type: 'package', target: 'github:marcelorodrigo/development-crew' } },
    { id: 'development-crew' },
  ])('does not update local, Git, or unrelated installations', (plugin) => {
    expect(getUpdateTarget(plugin)).toBeUndefined();
  });
});

describe('background updater lifecycle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('schedules only its configured package without delaying the caller', async () => {
    const runUpdate = vi.fn(async () => {});
    const ctx = mockContext();
    const cleanup = createAutoUpdater({ runUpdate })(ctx);

    expect(typeof cleanup).toBe('function');
    expect(ctx.plugin.list).not.toHaveBeenCalled();
    expect(runUpdate).not.toHaveBeenCalled();
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).toHaveBeenCalledExactlyOnceWith(target, {
      cwd: '/workspace/project', signal: expect.any(AbortSignal),
    });
    expect(ctx.storage.set).toHaveBeenCalledBefore(runUpdate);
    cleanup();
  });

  it('does no work when automatic updates are disabled', async () => {
    const runUpdate = vi.fn(async () => {});
    const ctx = mockContext();
    ctx.options.autoUpdate = false;
    createAutoUpdater({ runUpdate })(ctx);
    await vi.runOnlyPendingTimersAsync();
    expect(ctx.plugin.list).not.toHaveBeenCalled();
    expect(runUpdate).not.toHaveBeenCalled();
  });

  it('preserves a configured version range instead of switching it to latest', async () => {
    const range = `${packageName}@^1.0.0`;
    const runUpdate = vi.fn(async () => {});
    createAutoUpdater({ runUpdate })(mockContext({ type: 'package', target: range }));
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).toHaveBeenCalledExactlyOnceWith(range, expect.any(Object));
  });

  it.each([
    { type: 'local', path: '/checkout/index.js' },
    { type: 'package', target: `${packageName}@1.2.3` },
  ])('never invokes the updater for local or pinned installations', async (source) => {
    const runUpdate = vi.fn(async () => {});
    const ctx = mockContext(source);
    createAutoUpdater({ runUpdate })(ctx);
    await vi.runOnlyPendingTimersAsync();
    expect(ctx.storage.set).not.toHaveBeenCalled();
    expect(runUpdate).not.toHaveBeenCalled();
  });

  it('persists the cooldown across new updater instances and reloads', async () => {
    const stored = new Map();
    let now = 5_000_000;
    const runUpdate = vi.fn(async () => {});
    createAutoUpdater({ runUpdate, now: () => now })(mockContext(undefined, stored));
    await vi.runOnlyPendingTimersAsync();
    createAutoUpdater({ runUpdate, now: () => now })(mockContext(undefined, stored));
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).toHaveBeenCalledOnce();

    now += cooldown;
    createAutoUpdater({ runUpdate, now: () => now })(mockContext(undefined, stored));
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).toHaveBeenCalledTimes(2);
  });

  it('coalesces overlapping activations for the same package target', async () => {
    const pending = Promise.withResolvers<void>();
    const runUpdate = vi.fn(() => pending.promise);
    const start = createAutoUpdater({ runUpdate });
    start(mockContext());
    start(mockContext());
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).toHaveBeenCalledOnce();
    pending.resolve();
    await vi.runOnlyPendingTimersAsync();
  });

  it('records failed attempts so reloads do not repeatedly retry a broken installation', async () => {
    const stored = new Map();
    const runUpdate = vi.fn(async () => { throw new Error('Registry unavailable'); });
    createAutoUpdater({ runUpdate })(mockContext(undefined, stored));
    await vi.runOnlyPendingTimersAsync();
    createAutoUpdater({ runUpdate })(mockContext(undefined, stored));
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).toHaveBeenCalledOnce();
  });

  it.each(['list', 'get', 'set'])('isolates %s failures from activation', async (boundary) => {
    const ctx = mockContext();
    const runUpdate = vi.fn(async () => {});
    const method = boundary === 'list' ? ctx.plugin.list : ctx.storage[boundary as 'get' | 'set'];
    method.mockRejectedValueOnce(new Error('Optional update failed'));
    expect(() => createAutoUpdater({ runUpdate })(ctx)).not.toThrow();
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).not.toHaveBeenCalled();
  });

  it('recovers from invalid persisted timestamps and a backwards clock change', async () => {
    const runUpdate = vi.fn(async () => {});
    const now = 5_000_000;
    const start = createAutoUpdater({ runUpdate, now: () => now });
    for (const value of ['invalid', { time: now }, now + cooldown]) {
      const ctx = mockContext();
      ctx.storage.get.mockResolvedValueOnce(value);
      start(ctx);
      await vi.runOnlyPendingTimersAsync();
    }
    expect(runUpdate).toHaveBeenCalledTimes(3);
  });

  it('cancels scheduled work on unload', async () => {
    const ctx = mockContext();
    const runUpdate = vi.fn(async () => {});
    const cleanup = createAutoUpdater({ runUpdate })(ctx);
    cleanup();
    cleanup();
    await vi.runOnlyPendingTimersAsync();
    expect(ctx.plugin.list).not.toHaveBeenCalled();
    expect(runUpdate).not.toHaveBeenCalled();
  });

  it('does not start an update after unloading during discovery', async () => {
    const ctx = mockContext();
    const listed = await ctx.plugin.list();
    const pending = Promise.withResolvers<typeof listed>();
    ctx.plugin.list.mockReturnValueOnce(pending.promise);
    const runUpdate = vi.fn(async () => {});
    const cleanup = createAutoUpdater({ runUpdate })(ctx);
    await vi.runOnlyPendingTimersAsync();
    cleanup();
    pending.resolve(listed);
    await vi.runOnlyPendingTimersAsync();
    expect(ctx.storage.set).not.toHaveBeenCalled();
    expect(runUpdate).not.toHaveBeenCalled();
  });

  it('aborts an in-flight native command on unload', async () => {
    const ctx = mockContext();
    let signal: AbortSignal | undefined;
    const runUpdate = vi.fn((_target: string, options: { signal: AbortSignal }) => {
      signal = options.signal;
      return new Promise<void>((_resolve, reject) => {
        signal!.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
      });
    });
    const cleanup = createAutoUpdater({ runUpdate })(ctx);
    await vi.runOnlyPendingTimersAsync();
    expect(signal?.aborted).toBe(false);
    cleanup();
    await vi.runOnlyPendingTimersAsync();
    expect(signal?.aborted).toBe(true);
  });

  it.each(['get', 'set'])('does not install after unloading during storage.%s', async (boundary) => {
    const ctx = mockContext();
    const pending = Promise.withResolvers<any>();
    ctx.storage[boundary as 'get' | 'set'].mockReturnValueOnce(pending.promise);
    const runUpdate = vi.fn(async () => {});
    const cleanup = createAutoUpdater({ runUpdate })(ctx);
    await vi.runOnlyPendingTimersAsync();
    cleanup();
    pending.resolve(undefined);
    await vi.runOnlyPendingTimersAsync();
    expect(runUpdate).not.toHaveBeenCalled();
  });
});

describe('native update command', () => {
  it('uses an argument array, a bounded runtime, and the plugin location', async () => {
    const execute = vi.fn(async () => ({ stdout: '', stderr: '' }));
    const signal = new AbortController().signal;
    await runNativeUpdate(target, { cwd: '/workspace/project', signal }, execute);
    expect(execute).toHaveBeenCalledExactlyOnceWith('opencode', ['plugin', 'update', target], {
      cwd: '/workspace/project', signal, timeout: 60_000, maxBuffer: 64 * 1024, windowsHide: true,
    });
  });

  it('passes native arguments intact through a real child process', async () => {
    const execute = promisify(execFile);
    const result = await runNativeUpdate(target, { cwd: process.cwd() }, (_command, args, options) => execute(
      process.execPath, ['-e', 'process.stdout.write(JSON.stringify(process.argv.slice(1)))', ...args], options,
    ));
    expect(JSON.parse(result.stdout)).toEqual(['plugin', 'update', target]);
  });

  it('propagates command failures to the background coordinator', async () => {
    const execute = vi.fn(async () => { throw new Error('CLI unavailable'); });
    await expect(runNativeUpdate(target, { cwd: process.cwd() }, execute)).rejects.toThrow('CLI unavailable');
  });

  it('can cancel a real child process without requiring a service restart', async () => {
    const execute = promisify(execFile);
    const controller = new AbortController();
    const pending = runNativeUpdate(target, { cwd: process.cwd(), signal: controller.signal }, (_command, _args, options) => execute(
      process.execPath, ['-e', 'setInterval(() => {}, 1000)'], options,
    ));
    const rejected = expect(pending).rejects.toMatchObject({ code: 'ABORT_ERR' });
    controller.abort();
    await rejected;
  });
});
