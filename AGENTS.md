# AGENTS.md

## What this repo is

An OpenCode plugin (`development-crew`) that ships a **skills-first** development workflow. Four specialist skills (Rubber Duck, Architect, Implementer, Code Reviewer) are registered as on-demand skills and a bootstrap skill (`using-development-crew`) is injected into every session to orient the model. It is **not** a web app or service -- it is raw JavaScript loaded from `.opencode/plugins/development-crew.js` with no build step.

## Prerequisites

- Node >= 24 (pinned in `.node-version`)
- pnpm 11.7.0 (pinned via `packageManager` in `package.json`)

## Commands

```bash
pnpm install --frozen-lockfile   # install deps (never use npm)
pnpm run test                    # vitest run
```

There are no manual tests — vitest tests (`pnpm run test`) cover plugin hooks. The verification step is `node scripts/validate-skills.mjs` which checks that every `skills/*/SKILL.md` has valid frontmatter.

### Testing oh-my-pi changes locally

Link the local repo as an oh-my-pi plugin, then run the doctor to verify:

```bash
omp plugin link .
omp plugin doctor @marcelorodrigo/opencode-development-crew
```

When done testing, uninstall the local link:

```bash
omp plugin uninstall @marcelorodrigo/opencode-development-crew
```

This resolves the repo's `package.json` `omp` field (which points `./skills/` and `./hooks/`) and lets you test the TypeScript hook and skill loading end-to-end without publishing.

## Project structure

```text
.opencode/plugins/               # OpenCode plugin entry point (plain JS, no build)
  development-crew.js            # Plugin factory with config + messages.transform hooks

.claude-plugin/                  # Claude Code plugin manifests
  plugin.json                    # Claude Code plugin metadata
  marketplace.json               # Claude Code marketplace listing

.codex-plugin/                   # Codex CLI plugin manifest
  plugin.json                    # Codex CLI configuration with skills path + interface

.cursor-plugin/                  # Cursor plugin manifest
  plugin.json                    # Cursor configuration with skills + hooks

.github/plugin/                  # OpenCode plugin manifests
  plugin.json                    # OpenCode plugin metadata
  marketplace.json               # OpenCode marketplace listing

.omp-plugin/                     # oh-my-pi (OMP) plugin marketplace
  marketplace.json               # OMP marketplace listing

hooks/                           # SessionStart hooks for Claude Code / Cursor / Copilot CLI / oh-my-pi
  hooks.json                     # Claude Code hook config
  hooks-cursor.json              # Cursor hook config
  session-start                  # Bash script: reads bootstrap SKILL.md, strips frontmatter, outputs JSON
  run-hook.cmd                   # Cross-platform polyglot wrapper (Windows + Unix)
  omp-session-start.ts           # oh-my-pi TypeScript hook: injects bootstrap on session_start

skills/                          # Skill prompt definitions
  using-development-crew/SKILL.md  # Bootstrap skill: injected into every session
  rubber-duck/SKILL.md             # Brainstorming sparring partner
  architect/SKILL.md               # Architecture formalizer
  implementer/SKILL.md             # Builder / implementer
  code-reviewer/SKILL.md           # Code review specialist
  shared-principles/SKILL.md       # Shared design principles

GEMINI.md                        # Gemini context file (uses @-includes for skill files)

scripts/
  validate-skills.mjs            # CI: validates all SKILL.md frontmatter (name + description)

validation/
  validate_skills.py             # Validates skills/*.*/SKILL.md frontmatter (name + description)
```

## How the plugin works

The plugin has **no build step**. The entry point is `.opencode/plugins/development-crew.js` — raw JavaScript checked into the repo.

- **Bootstrap skill** (`skills/using-development-crew/SKILL.md`) is read at runtime via `fs.readFileSync` with a module-level cache (`_bootstrapCache`) to avoid repeated disk reads per agent step.
- **Config hook** registers the `skills/` directory in `opencodeConfig.skills.paths` so OpenCode discovers all skill files when invoked via the `skill` tool.
- **Messages transform hook** strips frontmatter from the bootstrap SKILL.md and prepends the body to the first user message in every new session.
- **SessionStart hooks** (for Claude Code, Cursor, Copilot CLI) are bash scripts that inject the same bootstrap content via `additionalContext` JSON output.
- **oh-my-pi hook** (`hooks/omp-session-start.ts`) is a TypeScript module registered via `package.json` `omp.hooks` that injects the bootstrap on `session_start`. oh-my-pi runs on Bun and executes TypeScript natively — no build step needed.

Idempotency: uses `<!-- development-crew-bootstrap -->` marker to avoid double injection.

## Skill file format

Every `skills/*/SKILL.md` file must follow this structure:

```markdown
---
name: skill-name
description: One-line description
---

(skill body in markdown)
```

Both `name` and `description` are required. The directory name must match the `name` field. CI will fail if any skill file is malformed or the bootstrap body is missing.

## Versioning

Version is managed by Release Please. It lives in multiple files that must stay in sync:
- `package.json` (source of truth)
- `.release-please-manifest.json`
- `.github/plugin/plugin.json` + `marketplace.json`
- `.claude-plugin/plugin.json` + `marketplace.json`
- `.omp-plugin/marketplace.json`

Release Please `extra-files` in `release-please-config.json` handles syncing automatically. Do not bump versions manually.

## CI workflows

- **build-opencode.yml** -- Validates skills + runs tests on push/PR
- **validate-plugin.yml** -- Validates plugin/marketplace JSON files and cross-file version consistency across GitHub, Claude, and OMP manifests
- **validate-pr-title.yml** -- Enforces conventional commit format on PR titles

## Conventions

- **Package manager**: Always use `pnpm`, never `npm` or `yarn`
- **Commit messages**: Conventional commits (see `release-please-config.json` for accepted types: `feat`, `fix`, `perf`, `deps`, `docs`, `chore`, `ci`, `refactor`, `test`, `build`, `style`, `revert`)
- **Default branch**: `master` (not `main`)
- **Plugin manifests**: Five sets exist -- `.github/plugin/` (OpenCode), `.claude-plugin/` (Claude Code), `.codex-plugin/` (Codex CLI), `.cursor-plugin/` (Cursor), `.omp-plugin/` (oh-my-pi). All must be kept in sync
- **Tests**: `pnpm run test` (vitest). Verification is `validate-skills.mjs` + `test`
