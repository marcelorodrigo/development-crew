# Installing Development Crew for OpenCode v2

## Prerequisites

- [OpenCode v2](https://opencode.ai/v2/docs) installed
- Node >=24 for local package installation and development

## Version compatibility

Use the package version that matches your OpenCode installation:

| OpenCode | Development Crew | Installation target |
|----------|------------------|---------------------|
| v1 | 0.x, last compatible release `0.17.0` | `@marcelorodrigo/opencode-development-crew@0.17.0` |
| v2 | 1.x, starting with `1.0.0` | `@marcelorodrigo/opencode-development-crew@latest` |

Development Crew 1.x uses the OpenCode v2 plugin API and does not support
OpenCode v1.

### Staying on OpenCode v1

Pin the exact compatible release in your existing v1 `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@marcelorodrigo/opencode-development-crew@0.17.0"]
}
```

Replace any existing floating entry rather than adding a second copy, then
restart OpenCode. The legacy updater follows npm's `latest` tag and can otherwise
install an incompatible 1.x release automatically. A major version boundary alone
does not protect users who leave a floating entry configured.

The [v0.17.0 installation guide](https://github.com/marcelorodrigo/development-crew/blob/v0.17.0/OPENCODE_INSTALL.md)
documents the legacy implementation.

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

Install Development Crew `1.0.0` or a later compatible 1.x release after upgrading
OpenCode to v2. Changing the configuration key alone does not make the legacy
`0.17.0` plugin implementation work in v2.

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

Development Crew automatically checks for and installs npm updates in the
background after plugin activation. It delegates installation to OpenCode v2's
native updater rather than modifying OpenCode's package cache itself.

Automatic updates apply only to this package's unpinned npm entries: the bare
package name, `@latest`, `@*`, or a semver range. Local checkouts, exact versions,
Git sources, other tags, and unrelated plugins are not automatically updated.
The configured target is preserved, so a range is not replaced with `@latest`.

Update attempts do not block startup. In-process activations share an in-flight
attempt, and a persisted one-hour cooldown prevents repeated attempts after a
reload, including when an update fails. Another attempt requires a later plugin
activation after the cooldown; there is no periodic polling timer. Optional
update failures do not disable skills or bootstrap instructions.

The OpenCode CLI must be available on the background service's `PATH`. The
command has a bounded runtime and is cancelled if this plugin instance unloads.
Development Crew does not force a service restart or display a custom update
toast.

To turn off automatic installation and manage updates manually:

```json
{
  "plugins": [
    {
      "package": "@marcelorodrigo/opencode-development-crew@latest",
      "options": { "autoUpdate": false }
    }
  ]
}
```

You can still check or update explicitly:

```bash
opencode plugin check
opencode plugin update @marcelorodrigo/opencode-development-crew@latest
```

Use the configured package target if your entry uses a different tag or range.
OpenCode skips local plugins and exact package revisions.

Prompts ship inside the npm package and are read once during plugin setup. When
the updated plugin loads, it registers the updated skills and bootstrap.
Previously loaded skill text in session history is not rewritten. Hot reload
alone does not download newer releases or reread captured prompt contents.

OpenCode reloads changes under watched configuration directories automatically;
unwatched dependencies may still require a restart. If an updated plugin remains
inactive, restart OpenCode or its server:

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
