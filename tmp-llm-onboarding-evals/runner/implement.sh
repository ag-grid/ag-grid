#!/usr/bin/env bash
# Stage 1 — build the app. Parallel-safe: implementing agents get no MCP.
#
# Runs OUTSIDE the repo. An agent running inside the AG Grid checkout could read
# packages/ag-grid-community/src and simply look up the correct current API.
set -euo pipefail

CRITERION="${1:?usage: implement.sh <criterion> <run>}"
RUN="${2:?usage: implement.sh <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVALS="$REPO/tmp-llm-onboarding-evals"
CRIT_DIR="$EVALS/criteria/$CRITERION"
WORK="/tmp/grid-eval/$CRITERION-$RUN"

[ -d "$CRIT_DIR" ] || { echo "no such criterion: $CRITERION" >&2; exit 1; }

rm -rf "$WORK"
mkdir -p "$WORK"
cp -R "$CRIT_DIR/template/." "$WORK/app"
mkdir -p "$WORK/meta"

TASK=$(awk '/^# Prompt/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")

# The prompt is the task and nothing else — written as a user would write it.
# No scaffolding preamble, no "make sure it builds": whether the agent builds or
# typechecks its own work is something we measure, not something we instruct.
printf '%s\n' "$TASK" > "$WORK/meta/implement.prompt.txt"

cd "$WORK/app"
npm install --no-audit --no-fund > "$WORK/meta/build.log" 2>&1

START=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# No --mcp-config: --strict-mcp-config with no config yields zero MCP servers.
# --setting-sources "" strips the user-scoped ag-* plugin skills, which would otherwise
# hand the agent conventions that differ from its training data.
set +e
claude -p "$(cat "$WORK/meta/implement.prompt.txt")" \
    --model opus \
    --setting-sources "" \
    --strict-mcp-config \
    --dangerously-skip-permissions \
    --output-format json \
    > "$WORK/meta/implement.json" 2> "$WORK/meta/implement.err"
EXIT=$?
set -e

END=$(date -u +%Y-%m-%dT%H:%M:%SZ)

python3 - "$WORK" "$CRITERION" "$RUN" "$START" "$END" "$EXIT" <<'PY'
import json, sys, os, re
work, criterion, run, start, end, exit_code = sys.argv[1:7]
meta = {
    "criterion": criterion, "run": int(run),
    "startedAt": start, "finishedAt": end,
    "implementExitCode": int(exit_code),
    "model": "opus",
}
try:
    t = json.load(open(f"{work}/meta/implement.json"))
    meta["numTurns"] = t.get("num_turns")
    meta["costUsd"] = t.get("total_cost_usd")
    meta["durationMs"] = t.get("duration_ms")
    blob = json.dumps(t)
    meta["fetchedDocs"] = "ag-grid.com" in blob
    meta["ranBuildOrTypecheck"] = bool(re.search(r"tsc|npm run build|vite build", blob))
except Exception as e:
    meta["transcriptError"] = str(e)

lock = f"{work}/app/package-lock.json"
if os.path.exists(lock):
    d = json.load(open(lock))
    for k, v in d.get("packages", {}).items():
        if k.endswith("node_modules/ag-grid-community"):
            meta["agGridVersion"] = v.get("version")

src = ""
for root, dirs, files in os.walk(f"{work}/app"):
    dirs[:] = [x for x in dirs if x != "node_modules"]
    for f in files:
        if f.endswith((".ts", ".tsx", ".js", ".jsx")):
            src += open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()
meta["enableDevValidationsPresent"] = "enableDevValidations" in src

json.dump(meta, open(f"{work}/meta/meta.json", "w"), indent=2)
print(json.dumps(meta, indent=2))
PY

# Harvest immediately so the app source and transcript are inspectable while
# verification is still running. verify.sh harvests again once results exist.
"$EVALS/runner/harvest.sh" "$CRITERION" "$RUN" > /dev/null

echo "implemented: $WORK"
