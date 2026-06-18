#!/usr/bin/env bash
# external/ag-shared/scripts/claude-hooks/format-tracked.sh
#
# Claude Code Stop hook. Formats the files edited this session (recorded by
# track-edit.sh) in a single batched `nx format` run, then clears the list.
#
# On success            → clear the list, exit 0.
# On a genuine failure  → keep the list, exit non-zero so Claude Code surfaces
#                         its standard (non-blocking) "<hook> hook error" notice;
#                         the model can react, and we retry next turn.
# Benign "no files matched" (e.g. root config files nx can't map to a project)
# is treated as success rather than nagging every turn.
#
# Reads hook JSON on stdin: { "session_id": "...", "cwd": "...", ... }  (no tool_input on Stop)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "$SCRIPT_DIR/_common.sh"

export NX_DAEMON=false
ch_sweep_stale

INPUT=$(cat 2>/dev/null || true)
SESSION_ID=$(printf '%s' "$INPUT" | jq -r '.session_id // empty' 2>/dev/null || true)
CWD=$(printf '%s' "$INPUT" | jq -r '.cwd // empty' 2>/dev/null || true)

LIST=$(ch_tracking_file "$SESSION_ID")
[ -f "$LIST" ] || exit 0

# Dedupe; keep only still-existing, formattable files.
mapfile -t FILES < <(sort -u "$LIST" | while IFS= read -r f; do
    [ -n "$f" ] && [ -f "$f" ] && ch_is_formattable "$f" && printf '%s\n' "$f"
done)

if [ "${#FILES[@]}" -eq 0 ]; then
    rm -f "$LIST"
    exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$CWD}"
[ -n "$ROOT" ] && [ -d "$ROOT" ] || ROOT=$(git -C "${CWD:-.}" rev-parse --show-toplevel 2>/dev/null || echo "$CWD")
cd "$ROOT" 2>/dev/null || { ch_log "could not resolve repo root; keeping list"; exit 1; }

CSV=$(IFS=,; printf '%s' "${FILES[*]}")

if OUT=$(yarn nx format --files "$CSV" 2>&1); then
    rm -f "$LIST"
    exit 0
fi

# nx couldn't associate the file(s) with a project — benign, not a format error.
if printf '%s' "$OUT" | grep -q "No files matching the pattern were found"; then
    rm -f "$LIST"
    exit 0
fi

# Genuine failure (e.g. a parse error in the model's own edit) — surface it.
printf '%s\n' "$OUT" >&2
ch_log "format failed for: $CSV"
exit 1
