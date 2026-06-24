#!/usr/bin/env python3
"""Validate .omp-plugin/marketplace.json configuration."""

import json
import sys


def validate_marketplace_json():
    """Validate .omp-plugin/marketplace.json structure and fields."""
    filepath = ".omp-plugin/marketplace.json"

    try:
        with open(filepath) as f:
            market = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: {filepath} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"ERROR: {filepath} is not valid JSON")
        sys.exit(1)

    errors = []

    if not market.get("name"):
        errors.append("marketplace.json: 'name' field is missing or empty")

    if not market.get("owner"):
        errors.append("marketplace.json: 'owner' field is missing")

    metadata = market.get("metadata", {})
    if not metadata.get("version"):
        errors.append("marketplace.json: 'metadata.version' is missing or empty")

    plugins = market.get("plugins")
    if not plugins or not isinstance(plugins, list) or len(plugins) == 0:
        errors.append("marketplace.json: 'plugins' array is missing or empty")
    else:
        for i, entry in enumerate(plugins):
            for field in ("name", "version", "source"):
                if not entry.get(field):
                    errors.append(f"marketplace.json: plugins[{i}].'{field}' is missing or empty")

    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        sys.exit(1)

    print(f"marketplace.json valid: name='{market['name']}', plugins={len(market['plugins'])}")


if __name__ == "__main__":
    validate_marketplace_json()
