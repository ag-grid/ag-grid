#!/usr/bin/env bash
# One column-sizing run, end to end.
#
#   implement -> capture console -> compute metrics -> judge the diff
#
# There is no functional verification. Round 1 ran 297 browser checks across 51 runs and found
# exactly one non-pass, and that one was the console check. The agents produce working software;
# the open question is whether they produce sane software.
#
# The console capture stays because it is deterministic, costs nothing, and catches the conflicts
# the grid itself declares — warning #318 in particular. It is not evidence that the app works.
#
# usage: cs-run.sh <criterion> <run> [port]
set -euo pipefail

CRITERION="${1:?usage: cs-run.sh <criterion> <run> [port]}"
RUN="${2:?usage: cs-run.sh <criterion> <run> [port]}"
PORT="${3:-5601}"
RUN_PADDED=$(printf '%02d' "$RUN")

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$EVALS/suites/column-sizing/runs/$CRITERION/$RUN_PADDED"

"$EVALS/runner/implement.sh" column-sizing "$CRITERION" "$RUN"

# ---- console capture -------------------------------------------------------------------------
# enableDevValidations() is injected only if the agent did not add it, and meta.json has already
# recorded which of those was the case.
#
# The injection is REVERTED before the diff is taken. It is instrumentation, not the agent's work,
# and leaving it in place makes the verifier count our own edit against the agent's minimality.
MAIN="$RUN_DIR/app/src/main.tsx"
INJECTED=0
if [ -f "$MAIN" ] && ! grep -rq "enableDevValidations" "$RUN_DIR/app/src" 2>/dev/null; then
    cp "$MAIN" "$RUN_DIR/main.tsx.orig"
    printf "%s\n%s\n" \
        "import { enableDevValidations } from 'ag-grid-community';" \
        "enableDevValidations();" | cat - "$MAIN" > "$MAIN.tmp" && mv "$MAIN.tmp" "$MAIN"
    INJECTED=1
fi

lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
sleep 1

(cd "$RUN_DIR/app" && npx vite --port "$PORT" --strictPort > "$RUN_DIR/vite.log" 2>&1) &
VITE_PID=$!
trap 'kill $VITE_PID 2>/dev/null || true; lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
    sleep 1
    curl -sf -o /dev/null "http://localhost:$PORT/" && break
done

node "$EVALS/runner/capture-console.mjs" "http://localhost:$PORT/" "$RUN_DIR" \
    > "$RUN_DIR/console-capture.log" 2>&1 || true

kill $VITE_PID 2>/dev/null || true
lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true

if [ "$INJECTED" = "1" ]; then
    mv "$RUN_DIR/main.tsx.orig" "$MAIN"
fi

# ---- metrics and judgement -------------------------------------------------------------------
python3 "$EVALS/runner/cs-metrics.py" "$CRITERION" "$RUN"
"$EVALS/runner/cs-verify.sh" "$CRITERION" "$RUN"
