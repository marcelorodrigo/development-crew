# Installing Development Crew for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add the published npm package to the `plugin` array in your `opencode.json`
(global or project-level):

```json
{
  "plugin": ["@marcelorodrigo/opencode-development-crew"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager and registers all skills.

Verify by asking: "Tell me about your Development Crew"

## Usage

Use OpenCode's native `skill` tool:

```
skill: rubber-duck
skill: architect
skill: implementer
skill: code-reviewer
```

## Updating

The unversioned npm installation resolves the latest published release and
checks npm for newer releases in the background. If the installation is an
eligible OpenCode npm cache wrapper, the wrapper is refreshed and a toast asks
you to restart OpenCode.

To use the repository directly instead of npm:

```json
{
  "plugin": ["development-crew@git+https://github.com/marcelorodrigo/development-crew.git"]
}
```

## Troubleshooting

### Skills not found

1. Use the `skill` tool to list what's discovered
2. Check that the plugin is loading (see logs: `opencode run --print-logs "hello" 2>&1 | grep -i development-crew`)
3. Make sure you're running a recent version of OpenCode

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with Git-backed
plugin specs. Prefer the published npm package. If OpenCode cannot install the
package directly, install it with system npm and point OpenCode at the local
package:

```powershell
npm install @marcelorodrigo/opencode-development-crew --prefix "$HOME\.config\opencode"
```

Then use the installed package path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/@marcelorodrigo/opencode-development-crew"]
}
```

### Tool mapping

Development Crew skills were originally authored for Claude Code. When running under OpenCode, map Claude Code tool references:

- `TodoWrite` → `todowrite`
- `Task` with subagents → `@mention` syntax
- `Skill` tool → OpenCode's native `skill` tool
- File operations → your native tools

## Getting Help

- Report issues: [https://github.com/marcelorodrigo/development-crew/issues](https://github.com/marcelorodrigo/development-crew/issues)
