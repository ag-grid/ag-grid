#!/usr/bin/env bash
# Stage 1 — build the app, then move it into the runs folder.
#
# The build happens in a temp directory because the implementing agent must not be able to read
# packages/ag-grid-*/src and simply look up the correct current API. Once it is done, everything
# moves into runs/<criterion>/<NN>/ and the temp directory is removed, so the run folder is the
# only copy from that point on.
#
# The directory is an unrelated uuid, not a shared parent keyed by criterion. Concurrent runs
# under a common parent are not independent: an agent can list `..`, read a sibling run's source,
# and pick up whatever a sibling left lying around. That happened — one run read a Playwright
# driver script another run had written into the shared parent, and every run silently inherited
# a Playwright install from an ancestor node_modules.
#
# Implementing agents get no MCP servers and no ag-* plugin skills, so this is parallel-safe.
set -euo pipefail

SUITE="${1:?usage: implement.sh <suite> <criterion> <run>}"
CRITERION="${2:?usage: implement.sh <suite> <criterion> <run>}"
RUN="${3:?usage: implement.sh <suite> <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITE_DIR="$EVALS/suites/$SUITE"
CRIT_DIR="$SUITE_DIR/criteria/$CRITERION"
DEST="$SUITE_DIR/runs/$CRITERION/$RUN"

[ -d "$SUITE_DIR" ] || { echo "no such suite: $SUITE" >&2; exit 1; }
WORK="/tmp/$(uuidgen | tr 'A-Z' 'a-z')"

[ -d "$CRIT_DIR" ] || { echo "no such criterion: $CRITERION" >&2; exit 1; }

rm -rf "$DEST"
mkdir -p "$WORK/meta"
cp -R "$CRIT_DIR/template/." "$WORK/app"

TASK=$(awk '/^# Prompt/{f=1;next} /^# /{f=0} f' "$CRIT_DIR/CRITERIA.md")

# The prompt is the task and nothing else — written as a user would write it. No scaffolding
# preamble, no "make sure it builds": whether the agent builds or typechecks its own work is
# something we measure, not something we instruct.
#
# BRIEF is the one exception, and it is the independent variable of the priming experiment: when
# set, the reference documentation is appended verbatim. Appending to the prompt rather than
# dropping a file in the repo isolates "did the brief help" from "did the agent find the file".
printf '%s\n' "$TASK" > "$WORK/meta/implement.prompt.txt"
if [ -n "${BRIEF:-}" ] && [ -f "$BRIEF" ]; then
    {
        printf '\n\n---\n\n# Reference documentation\n\n'
        cat "$BRIEF"
    } >> "$WORK/meta/implement.prompt.txt"
    cp "$BRIEF" "$WORK/meta/brief.md"
fi

cd "$WORK/app"
npm install --no-audit --no-fund > "$WORK/meta/build.log" 2>&1

START=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# --strict-mcp-config with no --mcp-config yields zero MCP servers.
# --setting-sources "" strips the user-scoped ag-* plugin skills, which would otherwise hand the
# agent conventions that differ from its training data.
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

"$EVALS/runner/save-transcript.sh" "$WORK/meta/implement.json" "$WORK/meta/implement.transcript.jsonl" || true

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

# Move, not copy. node_modules comes too, so the run folder is immediately runnable and editable.
mkdir -p "$DEST"
mv "$WORK/app" "$DEST/app"
mv "$WORK/meta"/* "$DEST/"
rm -rf "$WORK"

echo "implemented -> $DEST (nothing left in /tmp)"
