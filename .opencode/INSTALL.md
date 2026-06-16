# Installing Development Crew for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add development-crew to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["@marcelorodrigo/opencode-development-crew@git+https://github.com/marcelorodrigo/development-crew.git"]
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
  "plugin": ["@marcelorodrigo/opencode-development-crew@git+https://github.com/marcelorodrigo/development-crew.git#v1.0.0"]
}
```

## Troubleshooting

### Skills not found

1. Use the `skill` tool to list what's discovered
2. Check that the plugin is loading (see logs: `opencode run --print-logs "hello" 2>&1 | grep -i development-crew`)
3. Make sure you're running a recent version of OpenCode

## Getting Help

- Report issues: [https://github.com/marcelorodrigo/development-crew/issues](https://github.com/marcelorodrigo/development-crew/issues)
