#!/usr/bin/env bash
# Runs the merged unit-test suite directly via the Vitest workspace (vitest.workspace.ts), bypassing Nx:
# package (London-school) unit tests plus the behavioural (Chicago-school) black-box suite — one command.
# The workspace file also lists the node-env tooling projects (docs, ag-website-shared) so the IDE can
# discover them; by default this script restricts the run to the unit projects. Watch mode is off by
# default; all other arguments are forwarded to vitest.
#
# Usage:
#   ./behave.sh                           # Run the unit suite (package + behavioural)
#   ./behave.sh "file-pattern"            # Run tests matching a pattern across the unit projects
#   ./behave.sh "file-pattern" -t "name"  # Run a specific test by name
#   ./behave.sh --project docs            # Run specific workspace project(s) instead of the unit set
#   ./behave.sh --project all             # Run every project in the workspace (incl. docs, website)
#   ./behave.sh -w | --watch              # Run in watch mode
#   ./behave.sh --update                  # Update vitest snapshots
#   ./behave.sh --update-grid-rows[=dry]  # Update GridRows inline snapshots (dry = preview only)
#
# Output-volume controls, for when a suite fails wholesale and the diffs dwarf the results:
#   ./behave.sh --bail 1                  # Stop at the first failing test
#   ./behave.sh --no-diff                 # Report which tests fail; no assertion diff, snapshots cut to a line
#   ./behave.sh --diff-lines 10           # Cap each diff at 10 lines (0 = unlimited)
#   ./behave.sh --stack-trace-len 20      # Shorten captured stacks; default 40, keep >= 20

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default projects when the caller doesn't pick their own with --project (values are vitest test.names).
UNIT_PROJECTS=(ag-stack ag-grid-community ag-grid-enterprise locale behavioural)

args=()
userChoseProjects=false # caller passed --project <name> → run theirs instead of the defaults
runAllProjects=false    # caller passed `--project all` → no filter, every workspace project

# Reads a non-negative integer for `--opt N` or `--opt=N`, so neither spelling skips validation.
argValue=''
countArgValue() {
    local arg="$1" expected="$2"
    if [[ "$arg" == *=* ]]; then
        argValue="${arg#*=}"
    else
        argValue="${argv[i + 1]:-}"
        skipNext=true
    fi
    if [[ ! "$argValue" =~ ^[0-9]+$ ]]; then
        echo "Missing or invalid value for ${arg%%=*} (expected $expected)" >&2
        exit 1
    fi
}

argv=("$@")
skipNext=false
for ((i = 0; i < ${#argv[@]}; i++)); do
    if $skipNext; then
        skipNext=false
        continue
    fi
    arg="${argv[i]}"
    case "$arg" in
        --update-grid-rows)
            export UPDATE_GRID_ROWS_SNAPSHOTS=1
            ;;
        --update-grid-rows=dry)
            export UPDATE_GRID_ROWS_SNAPSHOTS=dry
            ;;
        --update-grid-rows=*)
            echo "Unknown value: $arg (expected --update-grid-rows or --update-grid-rows=dry)" >&2
            exit 1
            ;;
        --no-diff)
            export AG_NO_DIFF=1
            ;;
        --diff-lines | --diff-lines=*)
            countArgValue "$arg" "a line count, 0 = unlimited"
            export AG_DIFF_LINES="$argValue"
            ;;
        --stack-trace-len | --stack-trace-len=*)
            countArgValue "$arg" "a frame count, e.g. 20"
            # Below ~20 every inline snapshot fails "Couldn't infer stack frame". Allowed, but not silently.
            # `10#` or bash reads a leading zero as octal and errors on `08`.
            if ((10#$argValue < 20)); then
                echo "behave.sh: --stack-trace-len $argValue may break inline snapshots (keep >= 20)" >&2
            fi
            export AG_STACK_TRACE_LEN="$argValue"
            ;;
        --project=all)
            runAllProjects=true
            ;;
        --project=*)
            userChoseProjects=true
            args+=("$arg")
            ;;
        --project)
            next="${argv[i + 1]:-}"
            if [[ -z "$next" ]]; then
                echo "Missing value for --project (e.g. --project behavioural or --project all)" >&2
                exit 1
            elif [[ "$next" == "all" ]]; then
                runAllProjects=true
            else
                userChoseProjects=true
                args+=("$arg" "$next")
            fi
            skipNext=true
            ;;
        *)
            args+=("$arg")
            ;;
    esac
done

# Run from the repo root so Vitest picks up vitest.workspace.ts.
cd "$SCRIPT_DIR"

# Colour is for humans: an interactive terminal or CI (whose log viewer renders ANSI). An AI agent or a
# pipe reads the escapes as noise, and vitest emits them regardless of isTTY, so say so explicitly.
if [[ -z "${NO_COLOR:-}" && -z "${FORCE_COLOR:-}" ]]; then
    if [[ -n "${CLAUDECODE:-}${AI_AGENT:-}" ]] || { [[ -z "${CI:-}" ]] && [[ ! -t 1 ]]; }; then
        export NO_COLOR=1
    fi
fi

projectArgs=()
if ! $runAllProjects && ! $userChoseProjects; then
    for p in "${UNIT_PROJECTS[@]}"; do
        projectArgs+=(--project "$p")
    done
fi

exec npx vitest "${projectArgs[@]+"${projectArgs[@]}"}" "${args[@]+"${args[@]}"}"
