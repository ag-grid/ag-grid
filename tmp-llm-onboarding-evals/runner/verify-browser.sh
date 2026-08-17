#!/usr/bin/env bash
# Stage 2b — browser checks. Parallel-safe: Playwright MCP gives each agent its own
# browser, unlike chrome-devtools MCP which attaches to one shared Chrome and serialises.
#
# The console is captured mechanically by capture-console.mjs before the agent runs, so
# the console verdict never depends on an agent reading a log. The agent's job is only to
# drive interactions and observe the result.
set -euo pipefail

SUITE="${1:?usage: verify-browser.sh <suite> <criterion> <run>}"
CRITERION="${2:?usage: verify-browser.sh <suite> <criterion> <run>}"
RUN="${3:?usage: verify-browser.sh <suite> <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")
PORT="${PORT:?PORT must be set (each concurrent run needs its own port)}"

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/$SUITE"
CRIT_DIR="$SUITE_DIR/criteria/$CRITERION"
RUN_DIR="$SUITE_DIR/runs/$CRITERION/$RUN"

[ -d "$RUN_DIR/app" ] || { echo "no implemented app at $RUN_DIR" >&2; exit 1; }
mkdir -p "$RUN_DIR/screenshots"

# AG Grid emits deprecation and missing-module warnings only when validation is opted into, and
# almost no agent calls enableDevValidations itself. Add it if absent — recorded in meta.json,
# which captured whether the agent had already done so before this point.
if ! grep -rq "enableDevValidations" "$RUN_DIR/app/src" 2>/dev/null; then
    if [ -d "$RUN_DIR/app/node_modules/ag-grid-community" ]; then
        MAIN="$RUN_DIR/app/src/main.tsx"
        printf "%s\n%s\n" \
            "import { enableDevValidations } from 'ag-grid-community';" \
            "enableDevValidations();" | cat - "$MAIN" > "$MAIN.tmp" && mv "$MAIN.tmp" "$MAIN"
        echo "injected enableDevValidations() into app/src/main.tsx"
    fi
fi

cd "$RUN_DIR/app"
npx vite --port "$PORT" --strictPort > "$RUN_DIR/vite.log" 2>&1 &
VITE_PID=$!
trap 'kill $VITE_PID 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
    sleep 1
    if curl -sf -o /dev/null "http://localhost:$PORT/"; then break; fi
done

node "$EVALS/runner/capture-console.mjs" "http://localhost:$PORT/" "$RUN_DIR" \
    > "$RUN_DIR/console-capture.log" 2>&1 || true
cp "$RUN_DIR/load.png" "$RUN_DIR/screenshots/load.png" 2>/dev/null || true

CHECKS=$(awk '/^# Browser checks/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")
CONSOLE=$(cat "$RUN_DIR/console.txt" 2>/dev/null || echo "(console capture failed)")

cat > "$RUN_DIR/verify-browser.prompt.txt" <<EOF
An application written by another developer is running at http://localhost:$PORT/.

Use the Playwright MCP tools to load and interact with it.

===== CHECKS =====
$CHECKS
===== END =====

The browser console for a clean page load has already been captured mechanically. This is the
complete console output, and it is authoritative — use it to judge any check about the console
rather than trying to read the console yourself:

===== CONSOLE =====
$CONSOLE
===== END CONSOLE =====

Rules:
- Judge ONLY against the checks above. Do not add checks of your own.
- Actually perform each interaction. Do not infer that something works from the page's appearance
  alone where the check calls for clicking, dragging or typing.
- Return a result for EVERY BROWSER-n check listed above and for no others. Do not invent
  additional checks, do not merge two checks into one, and do not omit any.
- Record "pass" or "fail" for each. Use "blocked" only if a check genuinely cannot be evaluated,
  for example because the page did not load.
- Give concrete evidence for every result: what you did and what happened.
- Save at least one screenshot into $RUN_DIR/screenshots/.

Write your results to $RUN_DIR/result-browser.json as JSON of exactly this shape, using the check
IDs exactly as given above:

{
  "schemaVersion": 1,
  "criterion": "$CRITERION",
  "run": $((10#$RUN)),
  "browserChecks": [{ "id": "BROWSER-1", "result": "pass|fail|blocked", "evidence": "..." }]
}

Write the file. Your text reply is ignored; result-browser.json is the output that matters.
EOF

set +e
claude -p "$(cat "$RUN_DIR/verify-browser.prompt.txt")" \
    --model opus \
    --setting-sources "" \
    --strict-mcp-config \
    --mcp-config "$EVALS/runner/playwright-mcp.json" \
    --dangerously-skip-permissions \
    --output-format json \
    > "$RUN_DIR/verify-browser.json" 2> "$RUN_DIR/verify-browser.err"
EXIT=$?
set -e

"$EVALS/runner/save-transcript.sh" "$RUN_DIR/verify-browser.json" "$RUN_DIR/verify-browser.transcript.jsonl" || true

kill $VITE_PID 2>/dev/null || true

if [ -f "$RUN_DIR/result-browser.json" ]; then
    python3 -c "
import json
d=json.load(open('$RUN_DIR/result-browser.json'))
c=d['browserChecks']
print('$CRITERION/$RUN browser:', sum(1 for x in c if x['result']=='pass'), '/', len(c))"
else
    echo "BROWSER VERIFY FAILED (exit $EXIT) — no result-browser.json" >&2
    exit 1
fi
