# Installing Development Crew for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add development-crew to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["development-crew@git+https://github.com/marcelorodrigo/development-crew.git"]
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

Update the git tag in your `opencode.json` to pin a specific version:

```json
{
  "plugin": ["development-crew@git+https://github.com/marcelorodrigo/development-crew.git#v1.0.0"]
}
```

## Troubleshooting

### Skills not found

1. Use the `skill` tool to list what's discovered
2. Check that the plugin is loading (see logs: `opencode run --print-logs "hello" 2>&1 | grep -i development-crew`)
3. Make sure you're running a recent version of OpenCode

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs, including cache paths for `git+https` URLs and Bun not finding `git.exe` even when it works in a normal terminal. If OpenCode cannot install the plugin, try installing with system npm and pointing OpenCode at the local package:

```powershell
npm install development-crew@git+https://github.com/marcelorodrigo/development-crew.git --prefix "$HOME\.config\opencode"
```

Then use the installed package path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/development-crew"]
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
