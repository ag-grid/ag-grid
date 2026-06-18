#!/usr/bin/env bash
# external/ag-shared/scripts/claude-hooks/_common.sh
#
# Shared helpers for the Claude Code formatting hooks:
#   - track-edit.sh      (PostToolUse) records edited files for the session
#   - format-tracked.sh  (Stop)        batch-formats the tracked files
#   - precommit-check.sh (PreToolUse)  gates commits on formatted staged files
#
# Sourced, not executed. No `set -e` here — callers decide their own strictness.

# Prettier-supported, formattable file extensions used across the AG repos.
CH_FORMATTABLE_RE='\.(ts|tsx|js|jsx|cjs|mjs|json|jsonc|scss|css|less|html|md|mdx|ya?ml)$'

ch_log() { echo "[claude-fmt] $*" >&2; }

# Per-session scratch dir. There is no Claude-provided session temp dir env var,
# so we derive our own under TMPDIR, keyed by the session id from the hook stdin.
ch_session_dir() {
    local sid="${1:-}"
    [ -n "$sid" ] || sid="unknown"
    sid=$(printf '%s' "$sid" | tr -c 'A-Za-z0-9._-' '_')
    printf '%s/claude-session-%s' "${TMPDIR:-/tmp}" "$sid"
}

# The newline-delimited list of files edited this session.
ch_tracking_file() { printf '%s/edited-files.list' "$(ch_session_dir "$1")"; }

# True if the path has a formattable extension.
ch_is_formattable() { printf '%s' "$1" | grep -Eq "$CH_FORMATTABLE_RE"; }

# Best-effort cleanup of session dirs left behind by crashed sessions (>7 days
# old). Never fails the caller.
ch_sweep_stale() {
    find "${TMPDIR:-/tmp}" -maxdepth 1 -type d -name 'claude-session-*' -mtime +7 \
        -exec rm -rf {} + 2>/dev/null || true
}
