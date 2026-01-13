#!/bin/bash
# Vibe Coding Academy Tools - One-liner installer
# Usage: curl -fsSL https://raw.githubusercontent.com/mralbertzwolle/vibe-coding-academy-tools/main/install.sh | bash

set -e

REPO_URL="https://github.com/mralbertzwolle/vibe-coding-academy-tools.git"
INSTALL_DIR="$HOME/.claude/plugins/vibe-coding-academy"
PLUGINS=(
  "security-audit"
  "ai-seo-audit"
  "codebase-setup"
  "supabase-toolkit"
  "performance-audit"
  "accessibility-audit"
)

echo "🚀 Installing Vibe Coding Academy Tools..."
echo ""

# Create plugins directory
mkdir -p "$HOME/.claude/plugins"

# Clone or update repo
if [ -d "$INSTALL_DIR" ]; then
  echo "📦 Updating existing installation..."
  cd "$INSTALL_DIR"
  git pull --quiet
else
  echo "📦 Downloading plugins..."
  git clone --quiet "$REPO_URL" "$INSTALL_DIR"
fi

# Create/update settings to enable plugins
SETTINGS_FILE="$HOME/.claude/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
  # Backup existing settings
  cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"
fi

# Read existing settings or create new
if [ -f "$SETTINGS_FILE" ]; then
  SETTINGS=$(cat "$SETTINGS_FILE")
else
  SETTINGS='{}'
fi

# Add plugins to settings using a simple approach
echo "⚙️  Configuring plugins..."

# Create Python script to merge settings (more reliable than jq/sed)
python3 << 'PYTHON_SCRIPT'
import json
import os

settings_file = os.path.expanduser("~/.claude/settings.json")
install_dir = os.path.expanduser("~/.claude/plugins/vibe-coding-academy")

plugins = [
    "security-audit",
    "ai-seo-audit",
    "codebase-setup",
    "supabase-toolkit",
    "performance-audit",
    "accessibility-audit"
]

# Load existing settings
try:
    with open(settings_file, 'r') as f:
        settings = json.load(f)
except:
    settings = {}

# Ensure projects array exists
if "projects" not in settings:
    settings["projects"] = []

# Add plugin paths to mcpServers or plugins config
if "plugins" not in settings:
    settings["plugins"] = {}

for plugin in plugins:
    plugin_path = f"{install_dir}/plugins/{plugin}"
    settings["plugins"][f"{plugin}@vibe-coding-academy"] = True

# Write updated settings
with open(settings_file, 'w') as f:
    json.dump(settings, f, indent=2)

print(f"✅ Configured {len(plugins)} plugins")
PYTHON_SCRIPT

echo ""
echo "✅ Installation complete!"
echo ""
echo "Available commands:"
echo "  /security-audit:run     - Run 75+ security checks"
echo "  /ai-seo-audit:run       - AI discoverability audit"
echo "  /codebase-setup:init    - Project scaffolding"
echo "  /supabase-toolkit:*     - Supabase tools"
echo "  /performance-audit:run  - Performance analysis"
echo "  /accessibility-audit:run - WCAG 2.1 compliance"
echo ""
echo "🔄 Restart Claude Code to load the plugins"
echo ""
echo "📚 Docs: https://github.com/mralbertzwolle/vibe-coding-academy-tools"
