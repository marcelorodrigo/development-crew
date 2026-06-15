#!/usr/bin/env python3
"""Validate skill markdown file frontmatter."""

import os
import sys
import re


def main():
    """Validate that all skill files have required YAML frontmatter."""
    skills_dir = "skills"
    errors = []

    if not os.path.isdir(skills_dir):
        print(f"ERROR: '{skills_dir}' directory not found")
        sys.exit(1)

    skill_dirs = [
        d for d in os.listdir(skills_dir)
        if os.path.isdir(os.path.join(skills_dir, d))
    ]

    if not skill_dirs:
        print("ERROR: No skill directories found in skills/")
        sys.exit(1)

    for dirname in sorted(skill_dirs):
        path = os.path.join(skills_dir, dirname, "SKILL.md")

        if not os.path.isfile(path):
            errors.append(f"{path}: SKILL.md not found in skill directory '{dirname}'")
            continue

        with open(path) as f:
            content = f.read()

        # Normalize line endings
        content = content.replace('\r\n', '\n').replace('\r', '\n')

        # Check for frontmatter
        if not content.startswith("---"):
            errors.append(f"{path}: Missing YAML frontmatter (must start with ---)")
            continue

        # Parse frontmatter
        frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not frontmatter_match:
            errors.append(f"{path}: Malformed YAML frontmatter")
            continue

        fm = frontmatter_match.group(1)

        # Validate required fields
        if not re.search(r'^name:\s*\S', fm, re.MULTILINE):
            errors.append(f"{path}: Missing or empty 'name' field in frontmatter")
        if not re.search(r'^description:\s*\S', fm, re.MULTILINE):
            errors.append(f"{path}: Missing or empty 'description' field in frontmatter")

        print(f"OK: {path}")

    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
