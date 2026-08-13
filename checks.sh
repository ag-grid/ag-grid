#!/usr/bin/env bash
# Pre-commit gate: type-check + lint + spec type-check for the grid packages and the behavioural suite.
#
# Runs every task in ONE Nx invocation so they execute in parallel and hit the Nx cache — much
# faster than chaining a `yarn nx <target> <project>` per gate, which re-pays Nx startup each time
# and forces the tasks to run serially. Output is suppressed unless something fails.
#
# Usage:
#   ./checks.sh                       # Default gate (every project, matching CI)
#   ./checks.sh --projects a,b        # Narrow to specific projects
#   ./checks.sh --targets lint        # Override the target list
#   ./checks.sh --fresh               # Bypass the Nx cache
#   ./checks.sh --warn                # Print the warnings a passing run produced
#   ./checks.sh --verbose             # Print task output even when everything passes
#   ./checks.sh <extra nx args...>    # Anything else is forwarded to `nx run-many`

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Empty means every project. Nx skips projects that lack a target, so the gate covers the same ground as
# CI's `yarn nx lint` rather than a hand-maintained subset that silently drifts as packages are added.
PROJECTS=""
TARGETS="build:types,lint,build:test"
verbose=false
showWarnings=false
nxArgs=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        --projects=*) PROJECTS="${1#*=}" ;;
        --targets=*) TARGETS="${1#*=}" ;;
        --projects)
            PROJECTS="${2:?Missing value for --projects (comma-separated, e.g. ag-grid-community,ag-grid-enterprise)}"
            shift
            ;;
        --targets)
            TARGETS="${2:?Missing value for --targets (comma-separated, e.g. build:types,lint)}"
            shift
            ;;
        --fresh) nxArgs+=(--skip-nx-cache) ;;
        --warn) showWarnings=true ;;
        --verbose) verbose=true ;;
        *) nxArgs+=("$1") ;;
    esac
    shift
done

# The Nx daemon deadlocks on piped stdio in agent/CI shells; a single invocation only pays graph cost once.
export NX_DAEMON=false

# Nx has no "auto" and defaults to 3, which idles cores on a gate whose graph is ~5 tasks wide. Capped at 8
# so small runners do not thrash on memory-hungry tsc processes; a passed --parallel=N wins (nx takes last).
cores="$(nproc 2> /dev/null || sysctl -n hw.ncpu 2> /dev/null || echo 4)"
[[ "$cores" -gt 8 ]] && cores=8

IFS=',' read -r -a targetArr <<< "$TARGETS"

projectArgs=()
if [[ -n "$PROJECTS" ]]; then
    IFS=',' read -r -a projectArr <<< "$PROJECTS"
    projectArgs=(-p "${projectArr[@]}")
fi

run() {
    npx nx run-many -t "${targetArr[@]}" "${projectArgs[@]+"${projectArgs[@]}"}" \
        --parallel="$cores" --output-style=stream "${nxArgs[@]+"${nxArgs[@]}"}"
}

# Kept next to the other tooling scratch (ag-watch-status.json), so a passing gate can point at its warnings
# instead of discarding them with the temp log. Rewritten by any run that has warnings to report.
warningsLog="$SCRIPT_DIR/node_modules/.cache/ag-checks-warnings.log"
warnings=0

# Nx colours its output, which leaves an escape sequence flush against the word "warning" and defeats any
# word-boundary match, so strip escapes before counting or printing.
stripAnsi() {
    sed -E $'s/\033\\[[0-9;]*[a-zA-Z]//g' "$1"
}

# Sums ESLint's own per-project totals. Counting matching lines instead would miss wrapped messages and
# double-count the "N warnings potentially fixable" footer.
countWarnings() {
    stripAnsi "$1" |
        sed -nE 's/.*[0-9]+ problems? \([0-9]+ errors?, ([0-9]+) warnings?\).*/\1/p' |
        awk '{ total += $1 } END { print total + 0 }'
}

# Reprinted at the end so the failing tasks are the last thing on screen rather than lost up the stream.
# Two sources because neither is complete on its own: Nx marks each failure inline as "✖ nx run <task>",
# while its closing bullet list is capped at a handful of tasks but survives an interleaved stream.
failedTasks() {
    stripAnsi "$1" | awk '
        /^[[:space:]]*✖[[:space:]]+nx run / { sub(/^[[:space:]]*✖[[:space:]]+nx run[[:space:]]+/, ""); sub(/ .*/, ""); print; next }
        /^[[:space:]]*(Failed tasks:|✖[[:space:]]+[0-9]+\/[0-9]+ targets failed)/ { inList = 1; next }
        # Only bullets that look like a task id, or a task own output can pose as Nx summary list.
        inList && /^[[:space:]]*-[[:space:]]/ {
            sub(/^[[:space:]]*-[[:space:]]*/, "")
            sub(/^nx run[[:space:]]+/, "")
            if ($0 ~ /^[A-Za-z0-9@._\/-]+:[A-Za-z0-9:._-]+$/) print
            next
        }
        inList && NF { inList = 0 }
    ' | sort -u
}

start=$SECONDS

# An explicit XXXXXX template: GNU mktemp rejects `-t ag-checks`, and with errexit off that failure
# would silently redirect into an empty path and fail the gate before Nx ever runs.
log="$(mktemp "${TMPDIR:-/tmp}/ag-checks.XXXXXX")" || exit 1
trap 'rm -f "$log"' EXIT

# Never a pipe: node flushes pipes asynchronously, so nx exits mid-write and loses most of its output.
run > "$log" 2>&1
status=$?

if [[ $status -ne 0 ]] || $verbose; then
    cat "$log"
fi

if [[ $status -eq 0 ]]; then
    warnings="$(countWarnings "$log")"
    # A failed write must not leave the summary pointing at an absent log, or at a previous run's.
    if [[ "$warnings" -gt 0 ]] && ! { mkdir -p "$(dirname "$warningsLog")" && stripAnsi "$log" > "$warningsLog"; }; then
        warningsLog=""
    fi
fi

elapsed=$((SECONDS - start))
summary="targets: ${TARGETS} | projects: ${PROJECTS:-all}"

if [[ $status -eq 0 && "$warnings" -gt 0 ]]; then
    echo "CHECKS-PASSED (${elapsed}s) — ${summary}"
    if [[ -z "$warningsLog" ]]; then
        echo "  ${warnings} warnings (could not be written to disk)"
    elif $showWarnings; then
        # Keep the file-path lines ESLint prints above each block, or the rows say nothing about where.
        # Nx prefixes streamed lines with the task name, so the path is not always at the start of a line.
        grep -E '[0-9]+:[0-9]+[[:space:]]+warning|problems? \(|^([^:]+: )?/.*\.(ts|tsx|js|jsx|mjs|cjs|vue|astro)$' "$warningsLog"
        echo "  ${warnings} warnings: ${warningsLog}"
    else
        echo "  ${warnings} warnings (run with --warn to print them): ${warningsLog}"
    fi
elif [[ $status -eq 0 ]]; then
    echo "CHECKS-PASSED (${elapsed}s) — ${summary}"
else
    echo "CHECKS-FAILED (${elapsed}s) — ${summary}" >&2
    failedTasks "$log" | sed 's/^/  failed: /' >&2
fi
exit $status
