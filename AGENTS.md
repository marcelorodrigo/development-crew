# AGENTS.md

## What this repo is

An OpenCode plugin (`@marcelorodrigo/opencode-development-crew`) that ships four AI specialists as a pipeline: Rubber Duck, Architect, Implementer, and Code Reviewer. It is **not** a web app or service -- it builds to a single ESM bundle (`dist/index.js`) that OpenCode loads as a plugin.

## Prerequisites

- Node >= 24 (pinned in `.node-version`)
- pnpm 10.31.0 (pinned via `packageManager` in `package.json`)

## Commands

```bash
pnpm install --frozen-lockfile   # install deps (never use npm)
pnpm run typecheck               # tsc --noEmit
pnpm run build                   # tsup + tsc --emitDeclarationOnly -> dist/
pnpm run dev                     # tsup --watch
```

There are no tests. The verification step is the build itself plus `node scripts/verify-skills.mjs` which checks that every skill in the `skills/` directory is discoverable and has proper frontmatter.

## Project structure

```text
src/opencode/          # All TypeScript source (rootDir for tsc)
  index.ts             # Plugin entrypoint, exports DevelopmentCrewPlugin
  skills.ts            # Scans skills/ directory, builds skillsPaths array

skills/                # Specialist skill definitions (auto-discovered by the plugin)
  architect/           # Architect specialist (architecture formalization)
  code-reviewer/       # Code Reviewer specialist (code validation)
  implementer/         # Implementer specialist (code generation)
  rubber-duck/         # Rubber Duck specialist (brainstorming)
  using-development-crew/  # Bootstrap skill (auto-injected by plugin)
    SKILL.md           # Each skill has YAML frontmatter + markdown content

.codex/                # Codex CLI integration
  INSTALL.md           # Installation instructions for Codex CLI
  plugins/
    superpowers.js     # OpenCode plugin code (symlink target)

scripts/
  verify-skills.mjs    # Verification: checks skills directory structure and frontmatter
```

## How the plugin works

The plugin registers specialist skills via the skills path system:

1. **src/opencode/skills.ts** scans the `skills/` directory and exports a `skillsPaths` array
2. **src/opencode/index.ts** registers this array with OpenCode's `config.skills.paths`
3. OpenCode discovers skills at runtime without needing manual symlinks or file copying
4. The `using-development-crew` bootstrap skill is auto-discovered alongside the specialists

The plugin builds to `dist/index.js` (ESM bundle) that OpenCode loads. The build also generates type declarations.

## Skill structure

Every specialist skill has this structure:

```
skills/specialist-name/
├── SKILL.md           # Frontmatter + skill prompt
└── resources/         # Optional: helper files, scripts, references
```

The SKILL.md frontmatter includes:

```markdown
---
name: skill-name
description: One-line description of what the skill does
---

(Skill content in markdown)
```

Both `name` and `description` are required. The bootstrap skill also includes these to teach users when to invoke specialists.

## Versioning

Version is managed by Release Please. It lives in multiple files that must stay in sync:
- `package.json` (source of truth)
- `.release-please-manifest.json`
- `.github/plugin/plugin.json` + `marketplace.json`
- `.claude-plugin/plugin.json` + `marketplace.json`

Release Please `extra-files` in `release-please-config.json` handles syncing automatically. Do not bump versions manually.

## CI workflows

- **build-opencode.yml** -- Builds + typechecks + verifies skill discovery on push/PR
- **release-please.yml** -- Creates release PR on push to `master`, publishes to npmjs on release
- **validate-plugin.yml** -- Validates plugin/marketplace JSON files and cross-file version consistency
- **validate-pr-title.yml** -- Enforces conventional commit format on PR titles

## Conventions

- **Package manager**: Always use `pnpm`, never `npm` or `yarn`
- **Commit messages**: Conventional commits (see `release-please-config.json` for accepted types: `feat`, `fix`, `perf`, `deps`, `docs`, `chore`, `ci`, `refactor`, `test`, `build`, `style`, `revert`)
- **Default branch**: `master` (not `main`)
- **Plugin manifests**: Two sets exist -- `.github/plugin/` (OpenCode) and `.claude-plugin/` (Claude Code). Both must be kept in sync
- **No tests**: There is no test suite. Verification is `typecheck` + `build` + `verify-skills.mjs`
