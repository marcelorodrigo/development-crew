#!/usr/bin/env python3
"""Validate .github/plugin configuration files."""

import json
import sys
import re


def validate_plugin_json():
    """Validate .github/plugin/plugin.json structure and fields."""
    filepath = ".github/plugin/plugin.json"
    
    # Check if file exists
    try:
        with open(filepath) as f:
            plugin = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: {filepath} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"ERROR: {filepath} is not valid JSON")
        sys.exit(1)
    
    errors = []
    
    if not plugin.get("name"):
        errors.append("plugin.json: 'name' field is missing or empty")
    elif not re.match(r'^[a-zA-Z0-9-]+$', plugin["name"]):
        errors.append(f"plugin.json: 'name' field '{plugin['name']}' contains invalid characters (only A-Z, a-z, 0-9, and '-' are allowed)")
    
    if not plugin.get("description"):
        errors.append("plugin.json: 'description' field is missing or empty")
    
    if not plugin.get("version"):
        errors.append("plugin.json: 'version' field is missing or empty")
    elif not re.match(r'^\d+\.\d+\.\d+$', plugin["version"]):
        errors.append(f"plugin.json: 'version' field '{plugin['version']}' is not a valid semantic version (expected major.minor.patch)")
    
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        sys.exit(1)
    
    print(f"plugin.json valid: name='{plugin['name']}', version='{plugin['version']}'")


def validate_marketplace_json():
    """Validate .github/plugin/marketplace.json structure and fields."""
    plugin_filepath = ".github/plugin/plugin.json"
    market_filepath = ".github/plugin/marketplace.json"
    
    try:
        with open(plugin_filepath) as f:
            plugin = json.load(f)
        with open(market_filepath) as f:
            market = json.load(f)
    except FileNotFoundError as e:
        print(f"ERROR: {e.filename} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: {e.filename} is not valid JSON")
        sys.exit(1)
    
    plugin_name = plugin.get("name", "")
    errors = []
    
    if not market.get("name"):
        errors.append("marketplace.json: 'name' field is missing or empty")
    if not market.get("owner"):
        errors.append("marketplace.json: 'owner' field is missing")
    if not market.get("plugins") or not isinstance(market["plugins"], list) or len(market["plugins"]) == 0:
        errors.append("marketplace.json: 'plugins' array is missing or empty")
    else:
        for i, entry in enumerate(market["plugins"]):
            for field in ("name", "version", "source"):
                if not entry.get(field):
                    errors.append(f"marketplace.json: plugins[{i}].'{field}' is missing or empty")
            if entry.get("name") and entry["name"] != plugin_name:
                errors.append(f"marketplace.json: plugins[{i}].name '{entry['name']}' does not match plugin.json name '{plugin_name}'")
    
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        sys.exit(1)
    
    print(f"marketplace.json valid: name='{market['name']}', plugins={len(market['plugins'])}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "marketplace":
        validate_marketplace_json()
    else:
        validate_plugin_json()
