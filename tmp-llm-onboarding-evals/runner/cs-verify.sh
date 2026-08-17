#!/usr/bin/env bash
# Judge one column-sizing run against its expected result.
#
# Two questions only, both requiring quoted evidence. Not a code review, not a functional test:
# round 1 established that these agents produce working software, so the open question is whether
# they reach for the mechanism the grid provides or build their own on top of it.
#
# The verifier is given the diff and the mechanical metrics, and can read either tree in full.
#
# usage: cs-verify.sh <criterion> <run>
set -euo pipefail

CRITERION="${1:?usage: cs-verify.sh <criterion> <run>}"
RUN="${2:?usage: cs-verify.sh <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/column-sizing"
CRIT_DIR="$SUITE_DIR/criteria/$CRITERION"
RUN_DIR="$SUITE_DIR/runs/$CRITERION/$RUN"

[ -d "$RUN_DIR/app" ] || { echo "no implemented app at $RUN_DIR" >&2; exit 1; }

PROMPT_TEXT=$(awk '/^# Prompt/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")
EXPECTED=$(awk '/^# Expected/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")
DIFF=$(cat "$RUN_DIR/diff.patch" 2>/dev/null || echo "(no diff captured)")
METRICS=$(cat "$RUN_DIR/metrics.json" 2>/dev/null || echo "{}")
CONSOLE=$(cat "$RUN_DIR/console.txt" 2>/dev/null || echo "(no console capture)")

cat > "$RUN_DIR/verify.prompt.txt" <<EOF
A developer was given a working React application and asked to make one change. Judge what they did.

===== WHAT THEY WERE ASKED =====
$PROMPT_TEXT
===== END =====

===== WHAT A COMPETENT AG GRID DEVELOPER WOULD HAVE DONE =====
$EXPECTED
===== END =====

===== THEIR DIFF (template -> their app) =====
$DIFF
===== END =====

===== MECHANICAL METRICS (measured, not opinion) =====
$METRICS
===== END =====

===== BROWSER CONSOLE ON A CLEAN LOAD (captured mechanically, authoritative) =====
$CONSOLE
===== END =====

The original template is at $CRIT_DIR/template and their application is at $RUN_DIR/app. Read any
file in either tree if the diff alone does not tell you what you need. Do not run the application.

Answer exactly two questions.

1. usedExpectedApproach — did they use the approach described above as correct, including any of
   the alternatives it explicitly allows? Answer "yes" or "no".
   - The expected-result text is the authority. Do not substitute your own view of what good AG
     Grid code looks like, and do not fail a run for using an alternative that text permits.
   - Judge the approach, not the styling, naming or file layout.
   - If they used the expected mechanism AND also added something the expected text calls wrong,
     that is "no" — say which addition decided it.

2. isMinimal — is this close to the smallest change that implements the expected approach?
   Answer "yes" or "no".
   - "no" means there is materially more machinery here than the task needs: state that duplicates
     what the grid already tracks, event handlers that exist to re-derive something the grid
     supplies, measurement code, or hand-rolled logic replacing a built-in option.
   - Extra lines alone are not the test. A change can be long and still minimal, or short and still
     do the wrong thing in a roundabout way.

Give concrete evidence for both: quote the specific lines, with file and line number, that decided
your answer. If you answer "no", the evidence must identify the exact code responsible.

Write your result to $RUN_DIR/result.json as JSON of exactly this shape:

{
  "schemaVersion": 1,
  "criterion": "$CRITERION",
  "run": $((10#$RUN)),
  "usedExpectedApproach": "yes|no",
  "approachEvidence": "...",
  "isMinimal": "yes|no",
  "minimalEvidence": "...",
  "summary": "one sentence describing what they actually did"
}

Write the file. Your text reply is ignored; result.json is the output that matters.
EOF

set +e
claude -p "$(cat "$RUN_DIR/verify.prompt.txt")" \
    --model opus \
    --setting-sources "" \
    --strict-mcp-config \
    --dangerously-skip-permissions \
    --output-format json \
    > "$RUN_DIR/verify.json" 2> "$RUN_DIR/verify.err"
EXIT=$?
set -e

"$EVALS/runner/save-transcript.sh" "$RUN_DIR/verify.json" "$RUN_DIR/verify.transcript.jsonl" || true

if [ -f "$RUN_DIR/result.json" ]; then
    python3 -c "
import json
d = json.load(open('$RUN_DIR/result.json'))
print('$CRITERION/$RUN  approach=%s minimal=%s  %s' % (
    d['usedExpectedApproach'], d['isMinimal'], d.get('summary', '')[:110]))"
else
    echo "VERIFY FAILED (exit $EXIT) — no result.json" >&2
    exit 1
fi
