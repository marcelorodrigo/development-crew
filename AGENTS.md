# AGENTS.md

## What this repo is

An OpenCode plugin (`@marcelorodrigo/opencode-development-crew`) that ships five AI agents as a pipeline: Rubber Duck, Architect, Implementer, Code Reviewer, and Orchestrator. It is **not** a web app or service -- it builds to a single ESM bundle (`dist/index.js`) that OpenCode loads as a plugin.

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

There are no tests. The verification step is the build itself plus `node scripts/verify-agents.mjs` which checks every `agents/*.agent.md` name appears in `dist/index.js`.

## Project structure

```text
src/opencode/          # All TypeScript source (rootDir for tsc)
  index.ts             # Plugin entrypoint, exports DevelopmentCrewPlugin
  agents.ts            # Imports .agent.md files, parses frontmatter, builds agent configs
  parse-agent-md.ts    # Frontmatter parser (name + description + prompt)
  md.d.ts              # Ambient module declaration for *.md imports

agents/                # Agent prompt definitions (bundled into dist at build time)
  *.agent.md           # Each file has YAML frontmatter (name, description) + markdown prompt body

scripts/
  verify-agents.mjs    # CI verification: every agent name must appear in dist/index.js
```

## How the build works

tsup bundles `src/opencode/index.ts` into `dist/index.js` (ESM). The `.md` loader in `tsup.config.ts` inlines agent markdown files as strings. Then `tsc --emitDeclarationOnly` generates type declarations. The build output is **only** the `dist/` directory (see `files` in `package.json`).

## Agent markdown format

Every file in `agents/` must follow this structure:

```markdown
---
name: Agent Name
description: One-line description
---

(prompt body in markdown)
```

Both `name` and `description` are required. The parser (`parse-agent-md.ts`) extracts frontmatter and uses everything after the closing `---` as the prompt. CI will fail if any agent file is malformed or its name is missing from the bundle.

**Optional `permission:` block.** When present, it must be a multi-line YAML map. Inline form (`permission: { question: allow }`) is rejected. Each value is either a flat action (`ask` | `allow` | `deny`) or a nested map of pattern → action. The block is emitted on the agent's OpenCode config so the tools it gates (e.g. `question`) are guaranteed to be exposed regardless of OpenCode's defaults. See <https://opencode.ai/docs/agents/#permissions> for the full key list and ordering rules.

```markdown
---
name: DC Example
description: ...
permission:
  question: allow
---
```

**Why this exists:** the prompts instruct models to call the `question` tool for HITL approvals, but if the tool isn't declared, the model falls back to inline text — a broken approval flow. Declaring `permission` in frontmatter removes that gap. All five current agents set `question: allow`. If a future agent needs a different policy (e.g. read-only `code-reviewer` denying `edit`), encode it in the same block.

## Versioning

Version is managed by Release Please. It lives in multiple files that must stay in sync:
- `package.json` (source of truth)
- `.release-please-manifest.json`
- `.github/plugin/plugin.json` + `marketplace.json`
- `.claude-plugin/plugin.json` + `marketplace.json`

Release Please `extra-files` in `release-please-config.json` handles syncing automatically. Do not bump versions manually.

## CI workflows

- **build-opencode.yml** -- Builds + typechecks + verifies agent embedding on push/PR
- **release-please.yml** -- Creates release PR on push to `master`, publishes to npmjs on release
- **validate-plugin.yml** -- Validates plugin/marketplace JSON files and cross-file version consistency
- **validate-pr-title.yml** -- Enforces conventional commit format on PR titles

## Conventions

- **Package manager**: Always use `pnpm`, never `npm` or `yarn`
- **Commit messages**: Conventional commits (see `release-please-config.json` for accepted types: `feat`, `fix`, `perf`, `deps`, `docs`, `chore`, `ci`, `refactor`, `test`, `build`, `style`, `revert`)
- **Default branch**: `master` (not `main`)
- **Plugin manifests**: Two sets exist -- `.github/plugin/` (OpenCode) and `.claude-plugin/` (Claude Code). Both must be kept in sync
- **No tests**: There is no test suite. Verification is `typecheck` + `build` + `verify-agents.mjs`
