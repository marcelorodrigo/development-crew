# Proposal: Drop Claude Code and GitHub Copilot Support

## Why

The project currently maintains dual plugin support (OpenCode and Claude Code / GitHub Copilot CLI) which creates operational overhead: two manifest sets, cross-manifest version validation, Release Please syncing across six JSON files, and parallel README sections. The team has decided to focus exclusively on OpenCode, eliminating the multi-tool coordination burden while simplifying release and deployment workflows.

## What Changes

- **CI:** Remove Claude Code validation steps from `validate-plugin.yml` and simplify `validate_versions.py` to check only OpenCode plugin versions.
- **Configuration:** Remove `.claude-plugin/` directory and `validate_claude_plugin.py` script entirely.
- **Release Process:** Remove five `.claude-plugin/` entries from `release-please-config.json` `extra-files` array, reducing version-sync targets from six to three.
- **Documentation:** Remove all Claude Code and GitHub Copilot CLI installation, update, and uninstallation sections from README. Keep all Claude API model references (used by the agents themselves).

## Capabilities

### New Capabilities
None. This is a removal/simplification change.

### Modified Capabilities
None. No requirement or behavior changes. The agents' functionality remains identical; only distribution mechanism changes.

## Impact

- **Removed files:** `.claude-plugin/` (directory), `validation/validate_claude_plugin.py`
- **Modified files:**
  - `.github/workflows/validate-plugin.yml` (workflow steps removed)
  - `validation/validate_versions.py` (Claude plugin code blocks removed)
  - `release-please-config.json` (five extra-files entries removed)
  - `README.md` (parallel plugin sections removed; ~40 lines net reduction)
- **No impact on:** Source code, agent behavior, OpenCode plugin functionality, project version/package.json
- **CI/CD:** Simpler validation pipeline, faster release automation
