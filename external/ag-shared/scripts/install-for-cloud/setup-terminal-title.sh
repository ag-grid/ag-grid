#!/bin/bash
# Sets up terminal title for Claude Code sessions.
# Called from SessionStart hook via .claude-settings.json.
#
# Sets the terminal tab title to "<repo>: <branch>" so multiple
# sessions are distinguishable in VS Code / Cursor.

[ -n "$CLAUDE_ENV_FILE" ] || exit 0

# Derive repo name from git remote, falling back to directory name.
repo_name=$(git remote get-url origin 2>/dev/null \
    | sed -E 's|.*[:/]([^/]+)$|\1|; s|\.git$||')
[ -n "$repo_name" ] || repo_name=$(basename "$PWD")

cat >> "$CLAUDE_ENV_FILE" <<ENVEOF
printf '\033]0;${repo_name}: %s\007' "\$(git rev-parse --abbrev-ref HEAD 2>/dev/null || basename "\$PWD")"
ENVEOF
