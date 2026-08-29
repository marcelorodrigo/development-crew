# Development Crew

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub tag](https://img.shields.io/github/v/tag/marcelorodrigo/development-crew?label=version)](https://github.com/marcelorodrigo/development-crew/tags)

_Four specialists that don't just write code: they think about it, challenge you, design it, build it, and hold it accountable._

A **skills-first** development workflow — four specialist skills that coordinate structured software development from idea to reviewed code, on-demand and pipeline-native.

## Quickstart

Give your agent Development Crew: [Claude Code](#claude-code), [Codex CLI](#codex-cli), [Codex App](#codex-app), [OpenCode](#opencode), [Cursor](#cursor), [Gemini CLI](#gemini-cli), [GitHub Copilot CLI](#github-copilot-cli), [oh-my-pi](#oh-my-pi).

## How it works

**Development Crew** is a pipeline-first workflow: four specialist skills hand off to each other like a relay race, each one knowing exactly what to expect from the previous and what to produce for the next.

You start with a rough idea. The **Rubber Duck** challenges your assumptions and helps you shape it into a clear problem statement. The **Architect** formalizes the design into a precise, buildable spec. The **Implementer** writes production code and tests against that spec. The **Code Reviewer** inspects everything for bugs, edge cases, and architectural compliance before anything ships.

Each skill can be loaded independently — jump in at any point. But when you run the full pipeline, you get a structured, reviewable path from vague idea to verified code.

## Installation

Installation differs by harness. If you use more than one, install Development Crew separately for each one.

### Claude Code

- Add the marketplace:

  ```bash
  claude plugin marketplace add marcelorodrigo/development-crew
  ```

- Install the plugin:

  ```bash
  claude plugin install development-crew@development-crew-plugin
  ```

- Verify:

  ```bash
  /development-crew:rubber-duck
  ```

### Codex CLI

Add the repository as a plugin marketplace, then install Development Crew:

```bash
codex plugin marketplace add marcelorodrigo/development-crew
codex plugin add development-crew@development-crew-plugin
```

Start a new Codex session, then verify the installation with `/skills` or invoke a skill directly:

```text
$rubber-duck
```

### Codex App

- In the Codex app, click Plugins in the sidebar.
- Search for "Development Crew" in the marketplace.
- Click Install.

### OpenCode

Install the latest release globally:

```bash
opencode plugin @marcelorodrigo/opencode-development-crew@latest --global
```

Or add the package to the `plugin` array in your global or project-level
`opencode.json`:

```json
{
  "plugin": ["@marcelorodrigo/opencode-development-crew@latest"]
}
```

OpenCode installs the published npm package from this entry. Restart OpenCode
after adding or changing the plugin configuration.

The `@latest` tag resolves to the latest published release. The plugin also
performs a best-effort update check in the background. For an eligible floating
npm wrapper, it checks npm, installs and reifies the exact newer release, and
then shows a toast asking you to restart OpenCode. Before updating, the plugin
snapshots the skills outside the mutable package wrapper so OpenCode can still
discover and read `SKILL.md` files safely.

Exact-pinned, local, and Git installs are not auto-updated. Restart OpenCode to
activate newly installed code. Update failures are non-fatal and do not prevent
the plugin from starting.

If an older destructive updater left a stale `@latest` wrapper, install the
fixed release explicitly through OpenCode's plugin manager, using the same
scope as the original entry, then restart OpenCode:

```bash
opencode plugin @marcelorodrigo/opencode-development-crew@<fixed-version> --global --force
```

Replace `<fixed-version>` with the first release containing this updater fix.
For a project-level entry, omit `--global` and run the command from that
project. This temporarily pins the plugin; change its config entry back to
`@latest` afterward if you want future automatic updates. Do not remove
arbitrary cache or package paths manually.

To use the repository directly instead of npm:

```json
{
  "plugin": ["development-crew@git+https://github.com/marcelorodrigo/development-crew.git"]
}
```

Or fetch install instructions:

```
Fetch and follow instructions from https://raw.githubusercontent.com/marcelorodrigo/development-crew/master/OPENCODE_INSTALL.md
```

### Cursor

Add to your `.cursor/plugins.json`:

```json
{
  "plugins": ["development-crew@git+https://github.com/marcelorodrigo/development-crew.git"]
}
```

### Gemini CLI

```bash
gemini extensions install https://github.com/marcelorodrigo/development-crew
```

### GitHub Copilot CLI

- Add the marketplace:

  ```bash
  copilot plugin marketplace add marcelorodrigo/development-crew
  ```

- Install:

  ```bash
  copilot plugin install development-crew@development-crew-plugin
  ```

### oh-my-pi

- Add the marketplace:

  ```bash
  omp plugin marketplace add marcelorodrigo/development-crew
  ```

- Install the plugin:

  ```bash
  omp plugin install development-crew@development-crew-plugin
  ```

- Verify:

  ```bash
  /skill:rubber-duck
  ```

## The Pipeline

Use OpenCode's native `skill` tool. In current OpenCode versions, discovered
skills are also exposed as slash entries when no existing command has the same
name:

```text
/rubber-duck
/architect
/implementer
/code-reviewer
```

The slash entries come from OpenCode's skill discovery; this plugin does not
register custom commands. If a slash entry is unavailable, use the native
`skill` tool:

1. **rubber-duck** - Activates before writing code. Challenges assumptions, explores alternatives, asks the questions nobody else will. Produces a structured **Brainstorm Brief**.

2. **architect** - Activates with a clear direction or Brainstorm Brief. Applies the style appropriate to your tech stack. Names every class, places every file, defines every boundary. Produces a precise **Architecture Spec**.

3. **implementer** - Activates with an Architecture Spec. Writes production code and tests that match the project's conventions. Does not add features that weren't asked for. Runs the build until it passes. Produces an **Implementation Summary**.

4. **code-reviewer** - Activates with implemented code. Diffs against the default branch. Validates against the spec, project conventions, and loaded skills. Finds bugs, edge cases, architectural violations. Produces a **Code Review** with categorized findings and a verdict.

**The agent checks for relevant skills before every task.** Mandatory workflows, not suggestions.

## What's Inside

### Core Skills

- **rubber-duck** — Brainstorming sparring partner. Assumption-challenging, solution-space widening.
- **architect** — Architecture formalizer. Component design, package structure, API contracts, error handling.
- **implementer** — Builder. Production code, tests, build verification, convention matching.
- **code-reviewer** — Code review specialist. Architecture compliance, bug detection, security, test quality.
- **shared-principles** — Cross-cutting design principles followed by all technical specialists.

### Bootstrap

- **using-development-crew** — Orientation skill injected into every new session. Tells the agent about the pipeline, when to invoke each specialist, and how skills coordinate.

## Philosophy

- **Pipeline over chaos** — Structured handoffs beat ad-hoc coding
- **Design before code** — No implementation without a spec
- **Review before merge** — No merge without review
- **Precision over preference** — Name every component, every contract
- **Evidence over claims** — Run the build, verify the tests

## Contributing

1. Fork the repository
2. Switch to the `master` branch
3. Create a branch for your work
4. Run `pnpm install --frozen-lockfile`
5. Run `pnpm run test` and `node scripts/validate-skills.mjs` to verify
6. Submit a PR against `master`

## Updating

- **Claude Code:** `claude plugin update development-crew@development-crew-plugin`
- **GitHub Copilot:** `copilot plugin update development-crew@development-crew-plugin`
- **Gemini:** `gemini extensions update https://github.com/marcelorodrigo/development-crew`
- **oh-my-pi:** `omp plugin upgrade development-crew@development-crew-plugin`

- **OpenCode:** The `@latest` npm plugin entry checks npm in the background and
  installs the exact newer release into the eligible floating wrapper. Skills
  are snapshotted outside the mutable wrapper before the update. Restart
  OpenCode after the notification to activate the new code. Exact-pinned,
  local, and Git installs are not auto-updated, and update failures are
  non-fatal.

## License

MIT — see [LICENSE](LICENSE) for details.

## Community

Built by [Marcelo Rodrigo](https://github.com/marcelorodrigo).

- **Issues:** https://github.com/marcelorodrigo/development-crew/issues
- **Release announcements:** Watch the repo on GitHub
