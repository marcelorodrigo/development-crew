# AGENTS.md

## What this repo is

An OpenCode plugin (`@marcelorodrigo/opencode-development-crew`) that ships a **skills-first** development workflow. Four specialist skills (Rubber Duck, Architect, Implementer, Code Reviewer) are registered as on-demand skills and a bootstrap skill (`using-development-crew`) is injected into every session to orient the model. It is **not** a web app or service -- it builds to a single ESM bundle (`dist/index.js`) that OpenCode loads as a plugin.

## Prerequisites

- Node >= 24 (pinned in `.node-version`)
- pnpm 10.31.0 (pinned via `packageManager` in `package.json`)

## Commands

```bash
pnpm install --frozen-lockfile   # install deps (never use npm)
pnpm run typecheck               # tsc --noEmit
pnpm run build                   # tsup + tsc --emitDeclarationOnly -> dist/
pnpm run dev                     # tsup --watch
pnpm run test                    # vitest run
```

There are no manual tests — vitest tests (`pnpm run test`) cover plugin hooks. The verification step is the build itself plus `node scripts/verify-skills.mjs` which checks that every `skills/*/SKILL.md` has valid frontmatter and that the bootstrap skill body (`skills/using-development-crew/SKILL.md`) is embedded in `dist/index.js`.

## Project structure

```text
src/opencode/          # All TypeScript source (rootDir for tsc)
  index.ts             # Plugin entrypoint, exports DevelopmentCrewPlugin
  md.d.ts              # Ambient module declaration for *.md imports

skills/                # Skill prompt definitions (bundled into dist at build time)
  using-development-crew/SKILL.md  # Bootstrap skill: injected into every session
  rubber-duck/SKILL.md             # Brainstorming sparring partner
  architect/SKILL.md               # Architecture formalizer
  implementer/SKILL.md             # Builder / implementer
  code-reviewer/SKILL.md           # Code review specialist
  shared-principles/SKILL.md       # Shared design principles (standalone, loaded by technical skills)

scripts/
  verify-skills.mjs    # CI verification: skill frontmatter valid + bootstrap body in bundle

validation/
  validate_skills.py   # Validates skills/*.*/SKILL.md frontmatter (name + description)
```

## How the build works

tsup bundles `src/opencode/index.ts` into `dist/index.js` (ESM). The `.md` loader in `tsup.config.ts` inlines the bootstrap skill (`skills/using-development-crew/SKILL.md`) as a string. The `config` hook registers the `skills/` directory path at runtime; OpenCode discovers all `SKILL.md` files from that path when a user invokes the `skill` tool. Then `tsc --emitDeclarationOnly` generates type declarations. The build output is **only** the `dist/` directory (see `files` in `package.json`).

## Plugin hooks

The plugin provides two hooks:

### `config` hook

Registers the bundled `skills/` directory in `opencodeConfig.skills.paths` so OpenCode can discover all skill files when a user invokes the `skill` tool.

### `experimental.chat.messages.transform` hook

Prepends the body of `skills/using-development-crew/SKILL.md` (frontmatter stripped) to the first user message in every new session. This orients the model to the available skills and the pipeline workflow without requiring explicit invocation.

Idempotency: checks for `'Development Crew'` in existing message parts before injecting.

## Skill file format

Every `skills/*/SKILL.md` file must follow this structure:

```markdown
---
name: skill-name
description: One-line description
---

(skill body in markdown)
```

Both `name` and `description` are required. The directory name must match the `name` field. CI will fail if any skill file is malformed or the bootstrap body is missing from the bundle.

## Versioning

Version is managed by Release Please. It lives in multiple files that must stay in sync:
- `package.json` (source of truth)
- `.release-please-manifest.json`
- `.github/plugin/plugin.json` + `marketplace.json`
- `.claude-plugin/plugin.json` + `marketplace.json`

Release Please `extra-files` in `release-please-config.json` handles syncing automatically. Do not bump versions manually.

## CI workflows

- **build-opencode.yml** -- Builds + typechecks + verifies skill embedding on push/PR
- **release-please.yml** -- Creates release PR on push to `master`, publishes to npmjs on release
- **validate-plugin.yml** -- Validates plugin/marketplace JSON files and cross-file version consistency
- **validate-pr-title.yml** -- Enforces conventional commit format on PR titles

## Conventions

- **Package manager**: Always use `pnpm`, never `npm` or `yarn`
- **Commit messages**: Conventional commits (see `release-please-config.json` for accepted types: `feat`, `fix`, `perf`, `deps`, `docs`, `chore`, `ci`, `refactor`, `test`, `build`, `style`, `revert`)
- **Default branch**: `master` (not `main`)
- **Plugin manifests**: Two sets exist -- `.github/plugin/` (OpenCode) and `.claude-plugin/` (Claude Code). Both must be kept in sync
- **Tests**: `pnpm run test` (vitest). Verification is `typecheck` + `build` + `verify-skills.mjs` + `test`
