# Installing Development Crew for OpenCode 2

## Prerequisites

- [OpenCode 2](https://opencode.ai) installed (`opencode2`)

## Installation

Add Development Crew to the `plugins` array in your `opencode.json` (global or project-level):

```json
{
  "plugins": [
    "@marcelorodrigo/opencode-development-crew@git+https://github.com/marcelorodrigo/development-crew.git#opencode-v2"
  ]
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

Update the git tag or branch in your `opencode.json` to pin a specific version:

```json
{
  "plugins": [
    "@marcelorodrigo/opencode-development-crew@git+https://github.com/marcelorodrigo/development-crew.git#opencode-v2"
  ]
}
```

## Troubleshooting

### Skills not found

1. Use the `skill` tool to list what's discovered
2. Check that the plugin is loading (see logs: `opencode2 run --print-logs "hello" 2>&1 | grep -i development-crew`)
3. Make sure you're running OpenCode 2

### Tool mapping

Development Crew skills were originally authored for Claude Code. When running under OpenCode, map Claude Code tool references:

- `TodoWrite` → `todowrite`
- `Task` with subagents → `@mention` syntax
- `Skill` tool → OpenCode's native `skill` tool
- File operations → your native tools

## Getting Help

- Report issues: [https://github.com/marcelorodrigo/development-crew/issues](https://github.com/marcelorodrigo/development-crew/issues)
