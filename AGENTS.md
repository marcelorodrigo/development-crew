# AGENTS.md

## What this repo is

An OpenCode plugin (`@marcelorodrigo/opencode-development-crew`) that provides development workflow agents and skills. It ships:

- **One named agent**: `dc:rubber-duck` (registered as a named OpenCode agent in the plugin)
- **Four specialist skills**: `architect`, `implementer`, `code-reviewer`, `using-development-crew` (registered in the `skills/` directory)

It is **not** a web app or service -- it builds to a single ESM bundle (`dist/index.js`) that OpenCode loads as a plugin.

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

There are no tests. The verification step is the build itself plus `node scripts/verify-skills.mjs` which checks that:
- The `dc:rubber-duck` agent name appears in `dist/index.js`
- The rubber-duck agent's `permission:` block is embedded in the bundle
- All skills in `skills/*/SKILL.md` have valid frontmatter

## Project structure

```text
src/opencode/          # All TypeScript source (rootDir for tsc)
  index.ts             # Plugin entrypoint, exports DevelopmentCrewPlugin
  skills.ts            # Imports rubber-duck.agent.md, parses frontmatter, builds rubber-duck config + exports skills paths
  parse-agent-md.ts    # Frontmatter parser (name + description + prompt)
  md.d.ts              # Ambient module declaration for *.md imports

agents/                # Named agent definitions (bundled into dist at build time)
  rubber-duck.agent.md # Only named agent; YAML frontmatter + markdown prompt body

skills/                # Specialist skill definitions (registered via config.skills.paths)
  rubber-duck/SKILL.md           # Skill version for non-OpenCode harnesses
  architect/SKILL.md             # Skill with shared-principles inlined
  implementer/SKILL.md           # Skill with shared-principles inlined
  code-reviewer/SKILL.md         # Skill with shared-principles inlined
  using-development-crew/SKILL.md # Bootstrap skill that explains the development crew pipeline

scripts/
  verify-skills.mjs    # CI verification: checks rubber-duck agent + all skills
```

## How the build works

tsup bundles `src/opencode/index.ts` into `dist/index.js` (ESM). The `.md` loader in `tsup.config.ts` inlines the rubber-duck agent markdown file as a string. Then `tsc --emitDeclarationOnly` generates type declarations. The build output is **only** the `dist/` and `skills/` directories (see `files` in `package.json`).

## Named Agent Format (rubber-duck.agent.md)

The `agents/rubber-duck.agent.md` file is the only named agent and must follow this structure:

```markdown
---
name: DC Rubber Duck
description: One-line description
permission:
  question: allow
  edit: deny
  write: deny
  bash: deny
---

(prompt body in markdown)
```

Both `name` and `description` are required. The `permission:` block declares which tools this agent can access in OpenCode.

## Skill Format (skills/*/SKILL.md)

Specialist skills in the `skills/` directory follow this structure:

```markdown
---
name: skill-name
description: One-line description. Front-load keywords that describe when to use this skill.
---

(skill body in markdown)
```

Both `name` and `description` are required. Skills may optionally declare a `permission:` block (skills like `code-reviewer` that need tool restrictions); if absent, no tool restrictions apply to the skill.

### Key Differences from Agents

- **Named agents** (`agents/*.agent.md`): Registered directly as OpenCode agents via the plugin. Only `dc:rubber-duck` exists here.
- **Skills** (`skills/*/SKILL.md`): Bundled in the `skills/` directory and registered via `config.skills.paths`. Discoverable to any harness that supports skills (OpenCode, Claude Code, Codex CLI, etc.).

## Shared Design Principles

The five shared design principles are inlined (verbatim) at the end of the `architect`, `implementer`, and `code-reviewer` SKILL.md files. This makes each skill self-contained and removes inter-skill dependencies.

To update shared principles:
1. Edit the inline section at the end of each of the three SKILL.md files (keep them in sync).
2. You may also want to update this README to reflect the changes.

## Versioning

Version is managed by Release Please. It lives in multiple files that must stay in sync:
- `package.json` (source of truth)
- `.release-please-manifest.json`
- `.github/plugin/plugin.json` + `marketplace.json`
- `.claude-plugin/plugin.json` + `marketplace.json`

Release Please `extra-files` in `release-please-config.json` handles syncing automatically. Do not bump versions manually.

## CI workflows

- **build-opencode.yml** -- Builds + typechecks + verifies skill/agent embedding on push/PR
- **release-please.yml** -- Creates release PR on push to `master`, publishes to npmjs on release
- **validate-plugin.yml** -- Validates plugin/marketplace JSON files and cross-file version consistency
- **validate-pr-title.yml** -- Enforces conventional commit format on PR titles

## Conventions

- **Package manager**: Always use `pnpm`, never `npm` or `yarn`
- **Commit messages**: Conventional commits (see `release-please-config.json` for accepted types: `feat`, `fix`, `perf`, `deps`, `docs`, `chore`, `ci`, `refactor`, `test`, `build`, `style`, `revert`)
- **Default branch**: `master` (not `main`)
- **Plugin manifests**: Two sets exist -- `.github/plugin/` (OpenCode) and `.claude-plugin/` (Claude Code). Both must be kept in sync
- **No tests**: There is no test suite. Verification is `typecheck` + `build` + `verify-skills.mjs`

