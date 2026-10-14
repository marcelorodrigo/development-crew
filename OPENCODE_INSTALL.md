# Installing Development Crew for OpenCode v2

## Prerequisites

- [OpenCode v2](https://opencode.ai/v2/docs) installed
- Node >=24 for local package installation and development

This implementation uses the v2 plugin API. For OpenCode v1, keep the previous
v1-compatible release pinned at `@marcelorodrigo/opencode-development-crew@0.17.0`.

## Installation

Install the latest release globally:

```bash
opencode plugin add @marcelorodrigo/opencode-development-crew@latest
```

For project-level installation, add the package to `plugins` in the project's
`opencode.json` or `opencode.jsonc`. The same configuration works globally:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@marcelorodrigo/opencode-development-crew@latest"]
}
```

Restart OpenCode, then run `opencode plugin list`. The active plugin ID is
`development-crew`. Ask: "Tell me about your Development Crew" to verify that
the bootstrap instructions and skills are available.

## Migrating from OpenCode v1

Rename the `plugin` configuration key to `plugins`. If your entry uses a
package-and-options tuple, replace it with an object containing `package` and
`options`, as described in the [v2 migration guide](https://opencode.ai/v2/docs/build/plugins/migrate-v1).

Install the v2-compatible Development Crew release. Changing the configuration
key alone does not make an older v1 plugin implementation work in v2.

The v2 implementation registers skills through `ctx.skill.transform` and adds
bootstrap instructions through the session `context` hook. Instructions affect
outgoing agent requests without changing saved user messages. The bootstrap is
added again when OpenCode rebuilds context after tool calls or compaction.

## Usage

Use OpenCode's native `skill` tool:

```text
skill: rubber-duck
skill: architect
skill: implementer
skill: code-reviewer
```

When OpenCode exposes skill-derived slash entries, you can also use
`/rubber-duck`, `/architect`, `/implementer`, and `/code-reviewer`.
Development Crew does not register custom commands.

## Updating

OpenCode v2 owns plugin installation and updates:

```bash
opencode plugin check
opencode plugin update @marcelorodrigo/opencode-development-crew@latest
```

Use the configured package target if your entry uses a different tag or range.
Local plugins and exact package revisions are skipped. Development Crew no
longer rewrites OpenCode's package cache or runs its own background updater.

OpenCode reloads changes under watched configuration directories automatically.
If an updated plugin remains inactive, restart OpenCode or its server:

```bash
opencode service restart
```

## Local development

Install dependencies in the repository:

```bash
pnpm install --frozen-lockfile
```

Point the project's configuration at the repository directory:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/absolute/path/to/development-crew"]
}
```

Changes to local dependencies outside watched directories may require a restart.

## Troubleshooting

### Skills not found

1. Run `opencode plugin list` and check for `development-crew`.
2. Confirm you installed the v2-compatible release and use OpenCode v2.
3. Ask the agent to list its available skills.
4. Check plugin diagnostics for unreadable files or invalid skill metadata.

### Tool mapping

Development Crew skills were originally authored for Claude Code. Map tool
references to the tools available in your OpenCode session:

- `TodoWrite` to `todowrite`
- `Task` to your session's subagent tooling
- `Skill` to OpenCode's native `skill` tool
- File operations to your native file tools

## Getting help

Report issues at [GitHub](https://github.com/marcelorodrigo/development-crew/issues).
