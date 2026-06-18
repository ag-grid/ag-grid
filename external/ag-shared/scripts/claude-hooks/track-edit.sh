#!/usr/bin/env bash
# external/ag-shared/scripts/claude-hooks/track-edit.sh
#
# Claude Code PostToolUse hook for Edit|MultiEdit|Write.
# Records the edited file path to a per-session list so it can be formatted once,
# in a batch, at turn end (see format-tracked.sh). This hook does NOT format —
# it must be fast and must never fail the originating tool (always exits 0).
#
# Reads hook JSON on stdin:
#   { "session_id": "...", "cwd": "...", "tool_input": { "file_path": "..." }, ... }

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "$SCRIPT_DIR/_common.sh"

INPUT=$(cat 2>/dev/null || true)
[ -n "$INPUT" ] || exit 0

FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
SESSION_ID=$(printf '%s' "$INPUT" | jq -r '.session_id // empty' 2>/dev/null || true)
CWD=$(printf '%s' "$INPUT" | jq -r '.cwd // empty' 2>/dev/null || true)

# Nothing to track, or not a formattable file → silently succeed.
[ -n "$FILE_PATH" ] || exit 0
ch_is_formattable "$FILE_PATH" || exit 0

# Only track files inside the project (skip dotfiles, plans, scratch edits, etc).
ROOT="${CLAUDE_PROJECT_DIR:-$CWD}"
if [ -n "$ROOT" ]; then
    case "$FILE_PATH" in
        "$ROOT"/*) ;;
        *) exit 0 ;;
    esac
fi

DIR=$(ch_session_dir "$SESSION_ID")
mkdir -p "$DIR" 2>/dev/null || exit 0
printf '%s\n' "$FILE_PATH" >> "$(ch_tracking_file "$SESSION_ID")" 2>/dev/null || true
exit 0
