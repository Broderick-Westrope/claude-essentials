#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PATH="$REPO_DIR/config"
EXPORT_LINE="export OPENCODE_CONFIG_DIR=\"$CONFIG_PATH\""

# Detect shell profile
detect_profile() {
    local shell_name
    shell_name="$(basename "$SHELL")"
    case "$shell_name" in
        zsh)  echo "$HOME/.zshrc" ;;
        bash)
            # Prefer .bashrc on Linux, .bash_profile on macOS
            if [[ -f "$HOME/.bash_profile" ]]; then
                echo "$HOME/.bash_profile"
            else
                echo "$HOME/.bashrc"
            fi
            ;;
        fish) echo "$HOME/.config/fish/config.fish" ;;
        *)    echo "$HOME/.profile" ;;
    esac
}

PROFILE="$(detect_profile)"

# Check if already installed
if grep -qF "OPENCODE_CONFIG_DIR" "$PROFILE" 2>/dev/null; then
    # Update existing line
    if grep -qF "$CONFIG_PATH" "$PROFILE"; then
        echo "Already installed. OPENCODE_CONFIG_DIR is set in $PROFILE"
        exit 0
    else
        echo "Updating OPENCODE_CONFIG_DIR in $PROFILE"
        # Remove old line(s) and append new one
        grep -vF "OPENCODE_CONFIG_DIR" "$PROFILE" > "$PROFILE.tmp"
        mv "$PROFILE.tmp" "$PROFILE"
    fi
fi

# Fish uses a different syntax
if [[ "$PROFILE" == *"fish"* ]]; then
    EXPORT_LINE="set -gx OPENCODE_CONFIG_DIR \"$CONFIG_PATH\""
fi

echo "" >> "$PROFILE"
echo "# claude-essentials for OpenCode" >> "$PROFILE"
echo "$EXPORT_LINE" >> "$PROFILE"

echo "Added OPENCODE_CONFIG_DIR to $PROFILE"
echo "  Pointing to: $CONFIG_PATH"
echo ""
echo "Run 'source $PROFILE' or restart your terminal, then start OpenCode."
