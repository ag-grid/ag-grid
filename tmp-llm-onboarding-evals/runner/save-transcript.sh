#!/usr/bin/env bash
# Copy an agent's FULL message transcript next to its result summary.
#
# `claude -p --output-format json` returns only the result envelope — cost, turn count, final
# text. The message history, which is where the agent's actual tool calls and reasoning live, is
# written by Claude Code to ~/.claude/projects/<encoded-cwd>/<session-id>.jsonl. Without this the
# only record of HOW an app was built is the app itself.
#
# Looked up by session id rather than by reconstructing the encoded cwd, which is brittle
# (/tmp resolves to /private/tmp on macOS, and the encoding rules are undocumented).
#
# usage: save-transcript.sh <result-json> <dest-jsonl>
set -euo pipefail

RESULT="${1:?usage: save-transcript.sh <result-json> <dest-jsonl>}"
DEST="${2:?usage: save-transcript.sh <result-json> <dest-jsonl>}"

[ -s "$RESULT" ] || { echo "no result json at $RESULT — cannot find session id" >&2; exit 0; }

SID=$(python3 -c "
import json, sys
try:
    print(json.load(open('$RESULT')).get('session_id') or '')
except Exception:
    print('')
")

[ -n "$SID" ] || { echo "no session_id in $RESULT" >&2; exit 0; }

SRC=$(find "$HOME/.claude/projects" -name "$SID.jsonl" -print -quit 2>/dev/null || true)

if [ -n "$SRC" ]; then
    cp "$SRC" "$DEST"
    echo "transcript saved: $DEST ($(wc -l < "$DEST" | tr -d ' ') messages)"
else
    echo "transcript not found for session $SID" >&2
fi
