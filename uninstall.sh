#!/usr/bin/env bash
set -euo pipefail

remove_from_profile() {
    local profile="$1"
    if [[ ! -f "$profile" ]]; then return; fi
    if grep -qF "OPENCODE_CONFIG_DIR" "$profile"; then
        grep -vF "OPENCODE_CONFIG_DIR" "$profile" | grep -v "# claude-essentials for OpenCode" > "$profile.tmp"
        mv "$profile.tmp" "$profile"
        echo "Removed OPENCODE_CONFIG_DIR from $profile"
    fi
}

# Clean all common profiles
for profile in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile" "$HOME/.config/fish/config.fish"; do
    remove_from_profile "$profile"
done

echo "Done. Restart your terminal or start a new shell session."
