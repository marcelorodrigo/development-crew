#!/usr/bin/env python3
"""Validate the Gemini CLI extension manifest."""

import json
import re
import sys


def main():
    """Validate gemini-extension.json and its referenced context file."""
    filepath = "gemini-extension.json"

    try:
        with open(filepath) as f:
            extension = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: {filepath} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"ERROR: {filepath} is not valid JSON")
        sys.exit(1)

    errors = []
    if not isinstance(extension, dict):
        errors.append(f"{filepath}: root value must be an object")
        extension = {}

    name = extension.get("name")
    if name != "development-crew":
        errors.append(f"{filepath}: 'name' must be 'development-crew'")
    elif not re.match(r"^[a-z0-9-]+$", name):
        errors.append(f"{filepath}: 'name' contains invalid characters")

    version = extension.get("version")
    if not isinstance(version, str) or not re.match(r"^\d+\.\d+\.\d+$", version):
        errors.append(f"{filepath}: 'version' must be a valid semantic version")

    if not isinstance(extension.get("description"), str) or not extension["description"].strip():
        errors.append(f"{filepath}: 'description' is missing or empty")

    context_file = extension.get("contextFileName")
    if context_file != "GEMINI.md":
        errors.append(f"{filepath}: 'contextFileName' must be 'GEMINI.md'")
    else:
        try:
            with open(context_file):
                pass
        except FileNotFoundError:
            errors.append(f"{filepath}: referenced context file '{context_file}' not found")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        sys.exit(1)

    print(f"gemini-extension.json valid: name='{name}', version='{version}'")


if __name__ == "__main__":
    main()
