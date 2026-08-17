#!/usr/bin/env bash
# Drive one full round: every criterion, end to end, N at a time.
#
# Each run is independent — implementing agents have no MCP, and each browser verifier gets its
# own Playwright browser and its own port — so whole runs fan out rather than stages.
#
# usage: run-round.sh <suite> <run-number> [concurrency]
set -uo pipefail

SUITE="${1:?usage: run-round.sh <suite> <run-number> [concurrency]}"
RUN="${2:?usage: run-round.sh <suite> <run-number> [concurrency]}"
CONC="${3:-6}"

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/$SUITE"
cd "$EVALS"

LOGS="$SUITE_DIR/results/logs/round-$RUN"
mkdir -p "$LOGS"

i=0
for c in $(ls "$SUITE_DIR/criteria"); do
    echo "$((5300 + i * 3 + RUN)) $c"
    i=$((i + 1))
done | xargs -P "$CONC" -n 2 sh -c \
    './runner/run.sh '"$SUITE"' $1 '"$RUN"' $0 > '"$LOGS"'/$1.log 2>&1 || echo "FAILED: $1"'

EXPECTED=$(ls "$SUITE_DIR/criteria" | wc -l | tr -d ' ')
GOT=$(ls "$SUITE_DIR"/runs/*/"$(printf '%02d' "$RUN")"/result-browser.json 2>/dev/null | wc -l | tr -d ' ')
echo "=== round $RUN: $GOT/$EXPECTED complete ==="
[ "$GOT" -lt "$EXPECTED" ] && echo "WARNING: round $RUN INCOMPLETE — re-run the missing criteria" >&2

python3 runner/report.py "$SUITE" | head -40
