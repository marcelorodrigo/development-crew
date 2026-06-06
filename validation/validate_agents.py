#!/usr/bin/env python3
"""Validate agent markdown file frontmatter."""

import os
import sys
import re


def main():
    """Validate that all agent files have required YAML frontmatter."""
    agents_dir = "agents"
    errors = []
    
    if not os.path.isdir(agents_dir):
        print(f"ERROR: '{agents_dir}' directory not found")
        sys.exit(1)
    
    agent_files = [f for f in os.listdir(agents_dir) if f.endswith(".agent.md")]
    
    if not agent_files:
        print("ERROR: No .agent.md files found in agents/")
        sys.exit(1)
    
    for filename in sorted(agent_files):
        path = os.path.join(agents_dir, filename)
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
        if not re.search(r'^permission:\s*$', fm, re.MULTILINE):
            errors.append(f"{path}: Missing 'permission' block in frontmatter (must be a multi-line YAML block, not inline)")
        
        print(f"OK: {path}")
    
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
