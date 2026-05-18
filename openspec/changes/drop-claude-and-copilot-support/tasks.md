# Tasks: Drop Claude Code and GitHub Copilot Support

## 1. CI Workflow Update

- [x] 1.1 Edit `.github/workflows/validate-plugin.yml` to remove all `.claude-plugin/` validation steps (lines 48–73: four shell steps + two Python validation steps)
- [x] 1.2 Verify remaining workflow validates only `.github/plugin/plugin.json` and `.github/plugin/marketplace.json`

## 2. Validation Script Refactor

- [x] 2.1 Edit `validation/validate_versions.py` to remove all `.claude-plugin/` code blocks (lines 36–49: file loading and version checks)
- [x] 2.2 Verify the script still loads and checks `.github/plugin/` versions correctly
- [x] 2.3 Run the script locally to confirm it validates OpenCode plugin versions without errors

## 3. File Deletion

- [x] 3.1 Delete `.claude-plugin/` directory entirely (contains `plugin.json` and `marketplace.json`)
- [x] 3.2 Delete `validation/validate_claude_plugin.py` file
- [x] 3.3 Confirm no other references to deleted files exist in the repository

## 4. Release Please Configuration

- [x] 4.1 Edit `release-please-config.json` to remove five `.claude-plugin/` entries from the `packages["."].extra-files` array (lines 40–53)
- [x] 4.2 Verify the config is valid JSON
- [x] 4.3 Confirm `.github/plugin/` entries (6 lines) remain intact

## 5. Documentation Updates

- [x] 5.1 Edit `README.md` to remove the entire "### Claude Code" installation section (lines 161–180)
- [x] 5.2 Edit `README.md` to remove the entire "### GitHub Copilot" installation section (lines 182–200)
- [x] 5.3 Edit `README.md` to remove the "### Claude Code" update section (lines 423–426)
- [x] 5.4 Edit `README.md` to remove the "### GitHub Copilot" update section (lines 428–432)
- [x] 5.5 Edit `README.md` to remove the "### Claude Code" uninstall section (lines 451–454)
- [x] 5.6 Edit `README.md` to remove the "### GitHub Copilot" uninstall section (lines 456–467)
- [x] 5.7 Verify all Claude API model references in the Configuration section (lines 383–409) remain untouched — those refer to Claude API, not Claude Code plugin

## 6. Final Verification

- [x] 6.1 Search the entire repository for stray references to "claude-plugin" or "copilot" (case-insensitive)
- [x] 6.2 Run `pnpm run typecheck` to ensure no TypeScript errors
- [x] 6.3 Run `pnpm run build` to ensure the build succeeds
  - [x] 6.4 Verify the validation scripts run without errors (if CI can be tested locally)
