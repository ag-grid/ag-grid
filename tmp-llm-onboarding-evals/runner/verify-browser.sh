#!/usr/bin/env bash
# Stage 2b — browser checks. Parallel-safe: Playwright MCP gives each agent its own
# browser, unlike chrome-devtools MCP which attaches to one shared Chrome and serialises.
#
# The console is captured mechanically by capture-console.mjs before the agent runs, so
# the console verdict never depends on an agent reading a log. The agent's job is only to
# drive interactions and observe the result.
set -euo pipefail

CRITERION="${1:?usage: verify-browser.sh <criterion> <run>}"
RUN="${2:?usage: verify-browser.sh <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")
PORT="${PORT:?PORT must be set (each concurrent run needs its own port)}"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVALS="$REPO/tmp-llm-onboarding-evals"
CRIT_DIR="$EVALS/criteria/$CRITERION"
WORK="/tmp/grid-eval/$CRITERION-$RUN"

[ -d "$WORK/app" ] || { echo "no implemented app at $WORK" >&2; exit 1; }
mkdir -p "$WORK/meta/screenshots"

# Serve a copy, so app/ stays exactly what the agent wrote. enableDevValidations() is
# instrumentation we add; it must not pollute the artefact we keep as evidence.
rm -rf "$WORK/served"
cp -R "$WORK/app" "$WORK/served"
if ! grep -rq "enableDevValidations" "$WORK/served/src" 2>/dev/null; then
    if [ -d "$WORK/served/node_modules/ag-grid-community" ]; then
        MAIN="$WORK/served/src/main.tsx"
        printf "%s\n%s\n" \
            "import { enableDevValidations } from 'ag-grid-community';" \
            "enableDevValidations();" | cat - "$MAIN" > "$MAIN.tmp" && mv "$MAIN.tmp" "$MAIN"
    fi
fi

cd "$WORK/served"
npx vite --port "$PORT" --strictPort > "$WORK/meta/vite.log" 2>&1 &
VITE_PID=$!
trap 'kill $VITE_PID 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
    sleep 1
    if curl -sf -o /dev/null "http://localhost:$PORT/"; then break; fi
done

node "$EVALS/runner/capture-console.mjs" "http://localhost:$PORT/" "$WORK/meta" \
    > "$WORK/meta/console-capture.log" 2>&1 || true
cp "$WORK/meta/load.png" "$WORK/meta/screenshots/load.png" 2>/dev/null || true

CHECKS=$(awk '/^# Browser checks/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")
CONSOLE=$(cat "$WORK/meta/console.txt" 2>/dev/null || echo "(console capture failed)")

cat > "$WORK/meta/verify-browser.prompt.txt" <<EOF
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
- Save at least one screenshot into $WORK/meta/screenshots/.

Write your results to $WORK/meta/result-browser.json as JSON of exactly this shape, using the check
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
claude -p "$(cat "$WORK/meta/verify-browser.prompt.txt")" \
    --model opus \
    --setting-sources "" \
    --strict-mcp-config \
    --mcp-config "$EVALS/runner/playwright-mcp.json" \
    --dangerously-skip-permissions \
    --output-format json \
    > "$WORK/meta/verify-browser.json" 2> "$WORK/meta/verify-browser.err"
EXIT=$?
set -e

kill $VITE_PID 2>/dev/null || true

if [ -f "$WORK/meta/result-browser.json" ]; then
    python3 -c "
import json
d=json.load(open('$WORK/meta/result-browser.json'))
c=d['browserChecks']
print('$CRITERION/$RUN browser:', sum(1 for x in c if x['result']=='pass'), '/', len(c))"
    "$EVALS/runner/harvest.sh" "$CRITERION" "$RUN" > /dev/null
else
    echo "BROWSER VERIFY FAILED (exit $EXIT) — no result-browser.json" >&2
    exit 1
fi
