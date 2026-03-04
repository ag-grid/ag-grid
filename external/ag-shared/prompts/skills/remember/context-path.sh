#!/usr/bin/env bash
# Usage: context-path.sh [--ensure-dir] [--list-rules]
# Output: key=value pairs, then ---CONTENT--- section, then optional ---RULES--- section
set -euo pipefail

BRANCH=$(git branch --show-current)
MAIN_REPO=$(git rev-parse --path-format=absolute --git-common-dir | sed 's/\.git$//')
SLUG_BASE=$(echo "$BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
HASH=$(echo -n "$BRANCH" | shasum | cut -c1-6)
SLUG="${SLUG_BASE}-${HASH}"
CONTEXT_FILE="${MAIN_REPO}.context/${SLUG}.md"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --ensure-dir) mkdir -p "${MAIN_REPO}.context"; shift ;;
        --list-rules) LIST_RULES=1; shift ;;
        *) shift ;;
    esac
done

echo "BRANCH=$BRANCH"
echo "SLUG=$SLUG"
echo "CONTEXT_FILE=$CONTEXT_FILE"

if [ -f "$CONTEXT_FILE" ]; then
    echo "STATUS=found"
    echo "---CONTENT---"
    cat "$CONTEXT_FILE"
else
    echo "STATUS=not_found"
fi

if [[ "${LIST_RULES:-}" == "1" ]]; then
    echo "---RULES---"
    RULES_DIR="${MAIN_REPO}.rulesync/rules/"
    if [ -d "$RULES_DIR" ]; then
        for f in "$RULES_DIR"*.md; do
            [ -f "$f" ] || continue
            echo "$(basename "$f"): $(grep -m1 '^[^-#[:space:]]' "$f" 2>/dev/null || echo '(no description)')"
        done
    fi
fi
