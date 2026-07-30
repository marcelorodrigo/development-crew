import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const sessionStartPath = path.join(repoRoot, 'hooks', 'session-start');
const wrapperPath = path.join(repoRoot, 'hooks', 'run-hook.cmd');

function hookEnvironment(overrides: Record<string, string> = {}) {
  const environment = { ...process.env };

  delete environment.CLAUDE_PLUGIN_ROOT;
  delete environment.COPILOT_CLI;
  delete environment.CURSOR_PLUGIN_ROOT;
  delete environment.PLUGIN_ROOT;

  return { ...environment, ...overrides };
}

function runSessionStart(
  overrides: Record<string, string> = {},
  pluginRoot = repoRoot,
) {
  return execFileSync('bash', [path.join(pluginRoot, 'hooks', 'session-start')], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: hookEnvironment(overrides),
  });
}

describe('session-start hook', () => {
  it('executes the configured Codex command and returns valid SessionStart JSON', () => {
    expect(fs.statSync(wrapperPath).mode & 0o111).not.toBe(0);

    const output = execFileSync(
      '/bin/sh',
      ['-c', '"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd" session-start'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        env: hookEnvironment({
          CLAUDE_PLUGIN_ROOT: repoRoot,
          PLUGIN_ROOT: repoRoot,
        }),
      },
    );
    const result = JSON.parse(output);

    expect(result.hookSpecificOutput.hookEventName).toBe('SessionStart');
    expect(result.hookSpecificOutput.additionalContext).toContain('Development Crew');
    expect(result.hookSpecificOutput.additionalContext).toContain('\n## Instruction Priority');
  });

  it('returns valid Cursor JSON', () => {
    const result = JSON.parse(
      runSessionStart({
        CURSOR_PLUGIN_ROOT: repoRoot,
      }),
    );

    expect(result.additional_context).toContain('Development Crew');
    expect(result.additional_context).toContain('\n## Instruction Priority');
  });

  it('returns valid Copilot JSON', () => {
    const result = JSON.parse(
      runSessionStart({
        CLAUDE_PLUGIN_ROOT: repoRoot,
        COPILOT_CLI: '1',
      }),
    );

    expect(result.additionalContext).toContain('Development Crew');
    expect(result.additionalContext).toContain('\n## Instruction Priority');
  });

  it('preserves JSON-sensitive content in every response format', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'development-crew-hook-'));
    const fixtureHooks = path.join(fixtureRoot, 'hooks');
    const fixtureSkills = path.join(fixtureRoot, 'skills', 'using-development-crew');
    const sensitiveContent =
      'JSON-sensitive: "quoted" \\backslash\nControls: before\bmiddle\fnext\u0001after';

    fs.mkdirSync(fixtureHooks, { recursive: true });
    fs.mkdirSync(fixtureSkills, { recursive: true });
    fs.copyFileSync(sessionStartPath, path.join(fixtureHooks, 'session-start'));
    fs.writeFileSync(
      path.join(fixtureSkills, 'SKILL.md'),
      `---\nname: using-development-crew\ndescription: Test fixture\n---\n\n${sensitiveContent}`,
    );

    try {
      const codexOutput = runSessionStart(
        {
          CLAUDE_PLUGIN_ROOT: fixtureRoot,
          PLUGIN_ROOT: fixtureRoot,
        },
        fixtureRoot,
      );
      const codex = JSON.parse(codexOutput);
      const cursor = JSON.parse(
        runSessionStart(
          {
            CURSOR_PLUGIN_ROOT: fixtureRoot,
          },
          fixtureRoot,
        ),
      );
      const copilot = JSON.parse(
        runSessionStart(
          {
            CLAUDE_PLUGIN_ROOT: fixtureRoot,
            COPILOT_CLI: '1',
          },
          fixtureRoot,
        ),
      );

      expect(codex.hookSpecificOutput.additionalContext).toContain(sensitiveContent);
      expect(cursor.additional_context).toContain(sensitiveContent);
      expect(copilot.additionalContext).toContain(sensitiveContent);
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
