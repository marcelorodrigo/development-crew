# Development Crew — AGENTS.md

## Repo identity

[`@marcelorodrigo/opencode-development-crew`](package.json:2) — an opencode plugin that registers 6 agents (Orchestrator, Repo Scout, Rubber Duck, Architect, Implementer, Code Reviewer). A CI/CD development pipeline. SDK: `@opencode-ai/plugin`.

## Source layout

- **Entrypoint:** `src/opencode/index.ts` — plugin registration. `tsconfig.json` `rootDir` is `src/opencode`; only that directory is compiled.
- **Agent definition files:** `agents/*.agent.md` — markdown with YAML frontmatter (`name:`, `description:`). Parsed at build time by `src/opencode/parse-agent-md.ts`, embedded into the JS bundle via tsup's `.md` text loader.
- **No test, lint, or format** scripts exist. Only `build`, `typecheck`, and `dev`.
- **Skills:** `.opencode/skills/` (5 openspec skills) and `.opencode/commands/` (5 opsx commands).
- **CI validation scripts:** `validation/validate_agents.py` (frontmatter check), `scripts/verify-agents.mjs` (agent names in dist bundle).

## Commands

```sh
pnpm run typecheck                 # tsc --noEmit
pnpm run build                     # tsup && tsc --emitDeclarationOnly (two steps chained)
pnpm run dev                       # tsup --watch
pnpm install --frozen-lockfile     # CI install
```

## CI / release flow

| Workflow | Trigger | Key steps |
|---|---|---|
| `validate-plugin.yml` | push/PR to `master` | `python3 validation/validate_agents.py` |
| `build-opencode.yml` | push/PR changing `src/`, `agents/`, or root config | `install → typecheck → build → verify-agents.mjs` |
| `validate-pr-title.yml` | PR events | `amannn/action-semantic-pull-request` — conventional commits |
| `release-please.yml` | push to `master` | release-please → on release: build → publish: `pnpm publish --provenance --access public --no-git-checks` |

- **Branch:** `master` (not `main`).
- **PR titles must follow conventional commits** (`feat:`, `fix:`, `perf:`, `deps:`, `chore:`, `ci:`, `refactor:`, `test:`, `build:`, `style:`, `revert:`).

## Agent architecture

- The orchestrator agent is a workflow engine that sequentially invokes the other 5 agents via the `task` tool. It **never** writes code or modifies source files.
- Agent prompts are defined in `agents/*.agent.md` — **these are the behavioral source of truth**. The TypeScript plumbing (`agents.ts`, `index.ts`) just registers them with opencode.
- Repo Scout generates `PROJECT_CONTEXT.md` dynamically at runtime (not checked in).
- OpenSpec CLI (`openspec`) is required at pipeline runtime but is **not** a dependency of this package — the user must install it.

## Requirements

- Node >= 24 (`.node-version`: `24`)
- pnpm (lockfile: `pnpm-lock.yaml`)
- No tests, no linter, no formatter configured
