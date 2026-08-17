#!/usr/bin/env bash
# Verify every column-sizing template in a real browser before any agent sees one.
#
# Each template is copied to a scratch directory and has enableDevValidations() injected there, so
# the shipped template stays exactly as the implementing agent will receive it — without the
# validations, which is what makes "did the agent enable them" measurable.
#
# usage: cs-verify-templates.sh [criterion]
set -uo pipefail

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/column-sizing"
OUT="$SUITE_DIR/template-verification"
SCRATCH="${TMPDIR:-/tmp}/cs-template-check"
PORT=5411

ONLY="${1:-}"

mkdir -p "$OUT"
rm -rf "$SCRATCH"
mkdir -p "$SCRATCH"

# One shared node_modules — the templates all declare identical dependencies.
cp -R "$SUITE_DIR/_base/." "$SCRATCH/app"
(cd "$SCRATCH/app" && npm install --no-audit --no-fund > "$SCRATCH/install.log" 2>&1) || {
    echo "npm install failed; see $SCRATCH/install.log" >&2
    exit 1
}

PASS=0
FAIL=0
FAILED=""

for dir in "$SUITE_DIR"/criteria/*/; do
    name=$(basename "$dir")
    [ -n "$ONLY" ] && [ "$name" != "$ONLY" ] && continue

    cp "$dir/template/src/App.tsx" "$SCRATCH/app/src/App.tsx"
    cp "$dir/template/src/data.ts" "$SCRATCH/app/src/data.ts"
    cp "$SUITE_DIR/_base/src/main.tsx" "$SCRATCH/app/src/main.tsx"

    printf "%s\n%s\n" \
        "import { enableDevValidations } from 'ag-grid-community';" \
        "enableDevValidations();" | cat - "$SCRATCH/app/src/main.tsx" > "$SCRATCH/main.tmp"
    mv "$SCRATCH/main.tmp" "$SCRATCH/app/src/main.tsx"

    # Kill by port, not by PID: `npx` spawns vite as a child, so killing the npx wrapper leaves the
    # server bound. A survivor serves the previous criterion's app to the next criterion's probe.
    lsof -ti:"$PORT" | xargs kill -9 2>/dev/null
    sleep 1

    (cd "$SCRATCH/app" && npx vite --port "$PORT" --strictPort > "$SCRATCH/vite.log" 2>&1) &
    VITE_PID=$!

    for _ in $(seq 1 40); do
        sleep 1
        curl -sf -o /dev/null "http://localhost:$PORT/" && break
    done

    node "$EVALS/runner/cs-check-template.mjs" "http://localhost:$PORT/" "$name" "$OUT"
    if [ $? -eq 0 ]; then PASS=$((PASS + 1)); else FAIL=$((FAIL + 1)); FAILED="$FAILED $name"; fi

    kill $VITE_PID 2>/dev/null
    wait $VITE_PID 2>/dev/null
    lsof -ti:"$PORT" | xargs kill -9 2>/dev/null
done

echo
echo "=== templates verified: $PASS pass, $FAIL fail ==="
[ -n "$FAILED" ] && echo "failed:$FAILED"
exit $((FAIL > 0))
