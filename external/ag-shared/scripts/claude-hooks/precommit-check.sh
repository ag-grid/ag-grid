#!/usr/bin/env bash
# external/ag-shared/scripts/claude-hooks/precommit-check.sh
#
# Claude Code PreToolUse hook (matcher: Bash). A read-only gate: when the Bash
# command is a `git commit` (incl. `--amend`, and chained forms like
# `git add -A && git commit ...`), it checks whether the STAGED content of the
# formattable files (the index blobs — exactly what will be committed, not the
# working tree) is already prettier-formatted. If any are not, it DENIES the
# commit with an actionable message so the model formats + re-stages + re-commits.
#
# It never mutates files, never stages, never stashes. The model performs the
# actual formatting through its own tool call, keeping its view in sync.
#
# Formatting is verified with the repo's own prettier on the staged blob:
#   - prettier is exactly what `nx format` invokes under the hood (verified
#     byte-identical output), so the gate agrees with the canonical formatter.
#   - `.prettierignore` is honoured (ignored paths echo unchanged via
#     --stdin-filepath, so they are never flagged) — matching `nx format`.
#
# Reads hook JSON on stdin: { "tool_input": { "command": "..." }, "cwd": "...", ... }

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "$SCRIPT_DIR/_common.sh"

# Allow the tool call to proceed under the normal permission flow (no JSON).
allow() { exit 0; }

# Deny the tool call and hand the reason to the model.
deny() {
    jq -n --arg r "$1" \
        '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    exit 0
}

INPUT=$(cat 2>/dev/null || true)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)
CWD=$(printf '%s' "$INPUT" | jq -r '.cwd // empty' 2>/dev/null || true)
[ -n "$CMD" ] || allow

# Act only on real git commits — not `git commit-tree`, not `--dry-run`.
printf '%s' "$CMD" | grep -Eq '(^|[^[:alnum:]_-])git[[:space:]]+commit([[:space:]]|$)' || allow
printf '%s' "$CMD" | grep -Eq 'commit-tree|--dry-run' && allow

ROOT=$(git -C "${CWD:-.}" rev-parse --show-toplevel 2>/dev/null) || allow
cd "$ROOT" || allow

# Resolve the repo's prettier (same binary nx format uses). Fall back to npx.
PRETTIER="$ROOT/node_modules/.bin/prettier"
prettier_fmt() {
    # Format the staged blob of "$1" to stdout. Ignored/unparseable paths echo
    # their input unchanged (prettier honours .prettierignore for --stdin-filepath).
    if [ -x "$PRETTIER" ]; then
        git show ":$1" 2>/dev/null | "$PRETTIER" --stdin-filepath "$1" 2>/dev/null
    else
        git show ":$1" 2>/dev/null | npx --no-install prettier --stdin-filepath "$1" 2>/dev/null
    fi
}

# Collect staged, formattable files whose staged blob is not already formatted.
# cmp -s compares exact bytes (catches trailing-newline differences too).
needs_fmt=()
while IFS= read -r f; do
    [ -n "$f" ] || continue
    ch_is_formattable "$f" || continue
    git cat-file -e ":$f" 2>/dev/null || continue
    # Skip symlinks: their staged blob is the target path, not file content.
    [ "$(git ls-files -s -- "$f" | awk '{print $1}')" = "120000" ] && continue
    cmp -s <(git show ":$f" 2>/dev/null) <(prettier_fmt "$f") || needs_fmt+=("$f")
done < <(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)

[ "${#needs_fmt[@]}" -gt 0 ] || allow

# Build a safely-quoted fix command naming only the offending files.
CSV=""
QUOTED=""
for f in "${needs_fmt[@]}"; do
    CSV="${CSV:+$CSV,}$f"
    QUOTED="${QUOTED:+$QUOTED }$(printf '%q' "$f")"
done

deny "Staged files are not formatted (checked against the staged index): ${needs_fmt[*]}. Run: yarn nx format --files \"${CSV}\" && git add ${QUOTED} — then re-commit. (auto-format pre-commit gate)"
