#!/usr/bin/env bash
# Drive one full round: implement -> verify-code -> verify-browser, for every criterion.
#
# Stages are separated because their concurrency limits differ, and because a browser
# flake should be re-runnable without re-paying for the implementation.
# Every stage is parallel: implementers and code verifiers have no MCP at all, and each
# browser verifier gets its own Playwright browser and its own port.
#
# usage: run-round.sh <run-number> [concurrency]
set -uo pipefail

RUN="${1:?usage: run-round.sh <run-number> [concurrency]}"
CONC="${2:-6}"

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$EVALS"

CRITERIA=$(ls criteria)
LOGS="/tmp/grid-eval/logs/round-$RUN"
mkdir -p "$LOGS"

echo "=== round $RUN: implement ($CONC at a time) ==="
echo "$CRITERIA" | xargs -P "$CONC" -I{} sh -c \
    "./runner/implement.sh {} $RUN > $LOGS/implement-{}.log 2>&1 || echo 'IMPLEMENT FAILED: {}'"

echo "=== round $RUN: verify code ($CONC at a time) ==="
echo "$CRITERIA" | xargs -P "$CONC" -I{} sh -c \
    "./runner/verify-code.sh {} $RUN > $LOGS/vcode-{}.log 2>&1 || echo 'CODE VERIFY FAILED: {}'"
grep -h "code:" "$LOGS"/vcode-*.log 2>/dev/null | sort

echo "=== round $RUN: verify browser ($CONC at a time) ==="
# Each concurrent verifier needs its own dev-server port.
i=0
for c in $CRITERIA; do
    echo "$((5300 + i * 3 + RUN)) $c"
    i=$((i + 1))
done | xargs -P "$CONC" -n 2 sh -c \
    'PORT=$0 ./runner/verify-browser.sh $1 '"$RUN"' > '"$LOGS"'/vbrowser-$1.log 2>&1 || echo "BROWSER VERIFY FAILED: $1"'
grep -h "browser:" "$LOGS"/vbrowser-*.log 2>/dev/null | sort

EXPECTED=$(echo "$CRITERIA" | wc -l | tr -d ' ')
GOT_CODE=$(find runs -name result-code.json | wc -l | tr -d ' ')
GOT_BROWSER=$(find runs -name result-browser.json | wc -l | tr -d ' ')
echo "=== round $RUN: completeness ==="
echo "criteria=$EXPECTED code-results=$GOT_CODE browser-results=$GOT_BROWSER (cumulative across rounds)"
if [ "$GOT_CODE" -lt "$EXPECTED" ] || [ "$GOT_BROWSER" -lt "$EXPECTED" ]; then
    echo "WARNING: round $RUN is INCOMPLETE — re-run the missing criteria before trusting the report" >&2
fi

# NOTE: do not pkill playwright/mcp here. Orphaned MCP servers from finished verifiers do
# accumulate, but the process name is shared with any interactive session's own MCP server,
# so a broad pkill kills those too. Left to be cleaned up manually between rounds.

echo "=== round $RUN complete ==="
python3 runner/report.py | head -60
