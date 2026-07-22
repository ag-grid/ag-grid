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

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default projects when the caller doesn't pick their own with --project (values are vitest test.names).
UNIT_PROJECTS=(ag-stack ag-grid-community ag-grid-enterprise locale behavioural)

args=()
userChoseProjects=false # caller passed --project <name> → run theirs instead of the defaults
runAllProjects=false    # caller passed `--project all` → no filter, every workspace project

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

projectArgs=()
if ! $runAllProjects && ! $userChoseProjects; then
    for p in "${UNIT_PROJECTS[@]}"; do
        projectArgs+=(--project "$p")
    done
fi

exec npx vitest "${projectArgs[@]+"${projectArgs[@]}"}" "${args[@]+"${args[@]}"}"
