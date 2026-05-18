# Design: Drop Claude Code and GitHub Copilot Support

## Context

The project has maintained dual plugin manifests (OpenCode and Claude Code) since inception. This required:
- Two parallel manifest directories (`.github/plugin/` and `.claude-plugin/`)
- Dual validation logic (separate Python scripts)
- Release Please syncing six version fields
- Three parallel README sections (install, update, uninstall)

The decision to go OpenCode-only simplifies the entire coordinate infrastructure without affecting agent functionality (the agents themselves are platform-agnostic).

## Goals

1. **Remove all Claude Code / GitHub Copilot CLI distribution infrastructure** while keeping OpenCode unchanged
2. **Simplify CI validation** to check only OpenCode files
3. **Reduce Release Please version-sync targets** from six to three
4. **Update documentation** to reflect OpenCode-only status

## Non-Goals

- Modifying agent behavior, capabilities, or source code
- Changing OpenCode plugin distribution
- Removing Claude API model references (used by the agents internally)
- Refactoring Python scripts beyond necessary cleanups

## Decisions

**D1: Four-commit, staged removal structure**  
Rationale: Allows reviewers to trace each removal independently (CI → file deletion → config → docs). Each commit is self-contained and logically motivated, reducing risk of merge conflicts or review confusion.

**D2: Keep `validate_versions.py` (rename optional)**  
Rationale: The simplified script is still useful for verifying OpenCode plugin version consistency. Renaming is a refactor luxury; leave it as-is unless the PR reviewers prefer `validate_github_plugin_versions.py`. The minimal set of changes wins here.

**D3: No `.release-please-manifest.json` changes**  
Rationale: The manifest stores only the root package version (`{ ".": "0.2.2" }`). Version syncing is entirely configured in `release-please-config.json`'s `extra-files`. Once those entries are removed, the manifest needs no change.

## Tradeoffs

- **Simplicity vs. Portability:** By dropping multi-tool support, we gain operational simplicity (one manifest, one validation, simpler docs) at the cost of future portability if OpenCode's plugin ecosystem changes. This aligns with the team's current priority.

## Risks

**Risk: Incomplete removal leaves dangling references**  
Mitigation: Exhaustive search for "claude", "copilot", ".claude-plugin" in source code and config before final PR merge. The `validate-plugin.yml` simplification ensures no future Claude files are required.

**Risk: Release Please fails after config change**  
Mitigation: Test Release Please dry-run locally before merge (create a dummy tag, check the config is valid). The change is safe — removing non-existent file references doesn't break validation.

## Open Questions

None. The scope is well-defined and fully scoped to configuration and documentation removal.

## Implementation Summary

Four independent commits in order:

1. **CI refactor:** Update `.github/workflows/validate-plugin.yml` and `validation/validate_versions.py` to skip Claude plugin checks
2. **File deletion:** Remove `.claude-plugin/` directory and `validation/validate_claude_plugin.py`
3. **Release config:** Update `release-please-config.json` to remove five `.claude-plugin/` extra-files entries
4. **Documentation:** Update `README.md` to remove parallel Claude Code and GitHub Copilot sections

No source code changes. No behavioral changes. Pure infrastructure simplification.
