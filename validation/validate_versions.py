#!/usr/bin/env python3
"""Validate version consistency across configuration files."""

import json
import sys


def main():
    """Validate that all version fields match package.json version."""
    try:
        with open("package.json") as f:
            pkg_version = json.load(f).get("version", "")
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to read package.json: {e}")
        sys.exit(1)
    
    version_sources = {
        "package.json $.version": pkg_version,
    }
    
    # Load GitHub plugin versions
    try:
        with open(".github/plugin/plugin.json") as f:
            version_sources[".github/plugin/plugin.json $.version"] = json.load(f).get("version", "")
        
        with open(".github/plugin/marketplace.json") as f:
            market = json.load(f)
            version_sources[".github/plugin/marketplace.json $.metadata.version"] = market.get("metadata", {}).get("version", "")
            plugins = market.get("plugins", [])
            for i, plugin in enumerate(plugins):
                version_sources[f".github/plugin/marketplace.json $.plugins[{i}].version"] = plugin.get("version", "")
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to read .github/plugin files: {e}")
        sys.exit(1)
    
    # Load Claude plugin versions
    try:
        with open(".claude-plugin/plugin.json") as f:
            version_sources[".claude-plugin/plugin.json $.version"] = json.load(f).get("version", "")
        
        with open(".claude-plugin/marketplace.json") as f:
            market = json.load(f)
            plugins = market.get("plugins", [])
            for i, plugin in enumerate(plugins):
                version_sources[f".claude-plugin/marketplace.json $.plugins[{i}].version"] = plugin.get("version", "")
            version_sources[".claude-plugin/marketplace.json $.metadata.version"] = market.get("metadata", {}).get("version", "")
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to read .claude-plugin files: {e}")
        sys.exit(1)

    # Load Codex and Cursor plugin versions
    try:
        with open(".codex-plugin/plugin.json") as f:
            version_sources[".codex-plugin/plugin.json $.version"] = json.load(f).get("version", "")

        with open(".cursor-plugin/plugin.json") as f:
            version_sources[".cursor-plugin/plugin.json $.version"] = json.load(f).get("version", "")
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to read Codex or Cursor plugin files: {e}")
        sys.exit(1)

    # Load OMP plugin versions
    try:
        with open(".omp-plugin/marketplace.json") as f:
            market = json.load(f)
            version_sources[".omp-plugin/marketplace.json $.metadata.version"] = market.get("metadata", {}).get("version", "")
            plugins = market.get("plugins", [])
            for i, plugin in enumerate(plugins):
                version_sources[f".omp-plugin/marketplace.json $.plugins[{i}].version"] = plugin.get("version", "")
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to read .omp-plugin/marketplace.json: {e}")
        sys.exit(1)
    
    # Check version consistency
    mismatches = []
    for source, version in version_sources.items():
        if version != pkg_version:
            mismatches.append(f"  {source}: '{version}'")
    
    if mismatches:
        print(f"ERROR: Version mismatch — package.json has '{pkg_version}', but:")
        for m in mismatches:
            print(m)
        sys.exit(1)
    
    print(f"Cross-file version consistency OK: all {len(version_sources)} version fields at '{pkg_version}'")


if __name__ == "__main__":
    main()
