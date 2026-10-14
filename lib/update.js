import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { valid, validRange } from 'semver';

const packageName = '@marcelorodrigo/opencode-development-crew';
const cooldown = 60 * 60 * 1000;
const execute = promisify(execFile);
const sharedFlights = new Map();

export function getUpdateTarget(plugin) {
  if (plugin.id !== 'development-crew' || plugin.source?.type !== 'package') return;
  const { target } = plugin.source;
  if (target === packageName) return target;
  if (typeof target !== 'string' || !target.startsWith(`${packageName}@`)) return;

  const specification = target.slice(packageName.length + 1).trim();
  if (specification === 'latest') return target;
  if (!specification) return;
  const range = validRange(specification);
  if (range !== null && valid(range) === null) return target;
}

export function runNativeUpdate(target, { cwd, signal }, run = execute) {
  return run('opencode', ['plugin', 'update', target], {
    cwd,
    signal,
    timeout: 60_000,
    maxBuffer: 64 * 1024,
    windowsHide: true,
  });
}

async function updateIfDue(ctx, target, signal, runUpdate, now) {
  const key = `auto-update:${target}`;
  const previous = await ctx.storage.get(key);
  if (signal.aborted) return;
  const time = now();
  if (typeof previous === 'number' && Number.isFinite(previous) && previous <= time && time - previous < cooldown) return;

  // Persist before installation so a reload cannot start an update loop.
  await ctx.storage.set(key, time);
  if (signal.aborted) return;
  await runUpdate(target, { cwd: ctx.location.directory, signal });
}

async function checkAutoUpdate(ctx, signal, flights, runUpdate, now) {
  const { data } = await ctx.plugin.list();
  if (signal.aborted) return;
  const target = data.map(getUpdateTarget).find(Boolean);
  if (!target) return;
  if (flights.has(target)) return flights.get(target);

  const flight = updateIfDue(ctx, target, signal, runUpdate, now);
  flights.set(target, flight);
  try {
    await flight;
  } finally {
    flights.delete(target);
  }
}

export function createAutoUpdater({
  runUpdate = runNativeUpdate,
  now = () => Date.now(),
  flights = sharedFlights,
} = {}) {
  return (ctx) => {
    if (ctx.options?.autoUpdate === false) return () => {};
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void checkAutoUpdate(ctx, controller.signal, flights, runUpdate, now).catch(() => {
        // Optional updates must never disrupt skill loading or session startup.
      });
    }, 0);
    timer.unref?.();

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  };
}

export const startAutoUpdate = createAutoUpdater();
