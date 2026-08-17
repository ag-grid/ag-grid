#!/usr/bin/env bash
# Stage 2a — code checks. Needs no browser, so this is fully parallel and has no MCP at all.
# Runs against the pristine source the agent wrote, before any instrumentation is injected.
set -euo pipefail

SUITE="${1:?usage: verify-code.sh <suite> <criterion> <run>}"
CRITERION="${2:?usage: verify-code.sh <suite> <criterion> <run>}"
RUN="${3:?usage: verify-code.sh <suite> <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/$SUITE"
CRIT_DIR="$SUITE_DIR/criteria/$CRITERION"
RUN_DIR="$SUITE_DIR/runs/$CRITERION/$RUN"

[ -d "$RUN_DIR/app" ] || { echo "no implemented app at $RUN_DIR" >&2; exit 1; }

CHECKS=$(awk '/^# Code checks/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")

cat > "$RUN_DIR/verify-code.prompt.txt" <<EOF
Review the source of the application in $RUN_DIR/app (ignore node_modules). Do not run it.

Evaluate each of the following checks by reading the code.

===== CHECKS =====
$CHECKS
===== END =====

Rules:
- Judge ONLY against the checks above. Do not apply your own opinion about what good AG Grid code
  looks like, and do not add checks of your own.
- The checks are the authority on what the correct API is. Do not substitute your own recollection
  of the AG Grid API for what they say.
- Return a result for EVERY CODE-n check listed above and for no others. Do not invent
  additional checks, do not merge two checks into one, and do not omit any.
- Record "pass" or "fail" for each. Use "blocked" only if a check genuinely cannot be evaluated.
- Give concrete evidence for every result: quote the code you saw, with its file and line.

Write your results to $RUN_DIR/result-code.json as JSON of exactly this shape, using the check IDs exactly as
given above:

{
  "schemaVersion": 1,
  "criterion": "$CRITERION",
  "run": $((10#$RUN)),
  "codeChecks": [{ "id": "CODE-1", "result": "pass|fail|blocked", "evidence": "..." }]
}

Write the file. Your text reply is ignored; result-code.json is the output that matters.
EOF

set +e
claude -p "$(cat "$RUN_DIR/verify-code.prompt.txt")" \
    --model opus \
    --setting-sources "" \
    --strict-mcp-config \
    --dangerously-skip-permissions \
    --output-format json \
    > "$RUN_DIR/verify-code.json" 2> "$RUN_DIR/verify-code.err"
EXIT=$?
set -e

"$EVALS/runner/save-transcript.sh" "$RUN_DIR/verify-code.json" "$RUN_DIR/verify-code.transcript.jsonl" || true

if [ -f "$RUN_DIR/result-code.json" ]; then
    python3 -c "
import json
d=json.load(open('$RUN_DIR/result-code.json'))
c=d['codeChecks']
print('$CRITERION/$RUN code:', sum(1 for x in c if x['result']=='pass'), '/', len(c))"
else
    echo "CODE VERIFY FAILED (exit $EXIT) — no result-code.json" >&2
    exit 1
fi
