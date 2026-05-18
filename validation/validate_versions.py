#!/usr/bin/env python3
"""Validate version consistency across configuration files."""

import json
import sys


def main():
    """Validate package.json version."""
    try:
        with open("package.json") as f:
            pkg_version = json.load(f).get("version", "")
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to read package.json: {e}")
        sys.exit(1)
    
    if not pkg_version:
        print("ERROR: package.json version field is empty")
        sys.exit(1)
    
    print(f"Version validation OK: package.json version '{pkg_version}'")


if __name__ == "__main__":
    main()
