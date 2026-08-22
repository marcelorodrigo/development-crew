# 2. OpenCode 2 support

Date: 2026-08-13

## Status

Accepted

## Context

OpenCode 2 (V2) introduces a new plugin API that is incompatible with OpenCode 1 (V1) plugins. The V2 API is still in beta.

This project is consumed directly as a git-backed package by Jumbo users, not released to npm. A typical V1 install entry looks like:

```json
"@marcelorodrigo/opencode-development-crew@git+https://github.com/marcelorodrigo/development-crew.git"
```

Because the plugin is installed as a package, OpenCode installs it into an isolated cache and resolves the plugin via `package.json` `main` (and `exports` if present). The package contents are not placed in the user's `.opencode/plugins/` directory, so V2 auto-discovery of `.opencode/plugins/` does not apply to the cached package files.

Key V2 changes affecting this plugin:

- Configuration field renamed from `plugin` to `plugins`.
- Plugin modules must export `Plugin.define({ id, setup })` from `@opencode-ai/plugin`.
- Skill paths are registered via `ctx.skill.transform((skills) => skills.source(...))` instead of `config.skills.paths`.
- Bootstrap context injection uses `ctx.session.hook("context", ...)` instead of `experimental.chat.messages.transform`.

## Decision

Use a dedicated V2 branch (`opencode-v2`) instead of supporting both APIs in the same branch.

- `master` remains V1-only.
- `opencode-v2` contains the V2 plugin and V2-specific documentation.
- On `opencode-v2`, `package.json` `main` points directly to the V2 plugin entry point.
- Add `@opencode-ai/plugin` as a runtime dependency on the `opencode-v2` branch.
- V2 users install from the branch specifier:

```json
"@marcelorodrigo/opencode-development-crew@git+https://github.com/marcelorodrigo/development-crew.git#opencode-v2"
```

## Consequences

- No V1/V2 coexistence conflicts in the same working tree.
- No `main`/`exports` compatibility dance is needed.
- The V2 branch can freely use V2-only dependencies and APIs.
- Bug fixes may need to be cherry-picked across branches until V1 is deprecated.
- The package name used by consumers (`@marcelorodrigo/opencode-development-crew`) differs from the repo's `package.json` name (`@marcelorodrigo/development-crew`). This pre-existing inconsistency must be resolved or documented separately.
