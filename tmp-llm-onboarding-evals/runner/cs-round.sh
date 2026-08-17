#!/usr/bin/env bash
# Drive one column-sizing round: every criterion, end to end, N at a time.
#
# Runs are independent — implementing agents have no MCP and no shared temp parent, and each run
# gets its own port — so whole runs fan out rather than stages.
#
# usage: cs-round.sh <run-number> [concurrency]
set -uo pipefail

RUN="${1:?usage: cs-round.sh <run-number> [concurrency]}"
CONC="${2:-5}"

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/column-sizing"
cd "$EVALS"

LOGS="$SUITE_DIR/results/logs/round-$RUN"
mkdir -p "$LOGS"

i=0
for c in $(ls "$SUITE_DIR/criteria"); do
    echo "$((5500 + i * 3 + RUN)) $c"
    i=$((i + 1))
done | xargs -P "$CONC" -n 2 sh -c \
    './runner/cs-run.sh $1 '"$RUN"' $0 > '"$LOGS"'/$1.log 2>&1 || echo "FAILED: $1"'

EXPECTED=$(ls "$SUITE_DIR/criteria" | wc -l | tr -d ' ')
GOT=$(ls "$SUITE_DIR"/runs/*/"$(printf '%02d' "$RUN")"/result.json 2>/dev/null | wc -l | tr -d ' ')
echo "=== round $RUN: $GOT/$EXPECTED complete ==="
[ "$GOT" -lt "$EXPECTED" ] && echo "WARNING: round $RUN INCOMPLETE — re-run the missing criteria" >&2

python3 runner/cs-report.py
