#!/usr/bin/env bash
# Runs behavioural tests directly via Vitest, bypassing Nx.
# All arguments are forwarded to vitest. Watch mode is disabled by default.
#
# Usage:
#   ./behave.sh                           # Run all tests
#   ./behave.sh "file-pattern"            # Run tests matching pattern
#   ./behave.sh "file-pattern" -t "name"  # Run specific test by name
#   ./behave.sh -w                        # Run in watch mode
#   ./behave.sh --watch                   # Run in watch mode
#   ./behave.sh --update                  # Update vitest snapshots
#   ./behave.sh --update-grid-rows         # Update GridRows inline snapshots
#   ./behave.sh --update-grid-rows=dry    # Dry-run: show what would change

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse --update-grid-rows flag
args=()
for arg in "$@"; do
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
        *)
            args+=("$arg")
            ;;
    esac
done

cd "$SCRIPT_DIR/testing/behavioural"

exec npx vitest "${args[@]+"${args[@]}"}"
