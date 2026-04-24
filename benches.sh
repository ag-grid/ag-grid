#!/usr/bin/env bash
# Runs behavioural benchmarks directly via Vitest, bypassing Nx.
# All arguments are forwarded to `vitest bench`. --run (non-watch) is the default.
#
# Usage:
#   ./benches.sh                           # Run all benchmarks once
#   ./benches.sh "file-pattern"            # Run benchmarks matching pattern
#   ./benches.sh "file-pattern" -t "name"  # Run specific benchmark by name
#   ./benches.sh -w                        # Run in watch mode
#   ./benches.sh --watch                   # Run in watch mode

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default to --run (non-watch) unless the caller passes -w / --watch.
run_flag="--run"
for arg in "$@"; do
    case "$arg" in
        -w | --watch)
            run_flag=""
            ;;
    esac
done

cd "$SCRIPT_DIR/testing/behavioural"

if [ -n "$run_flag" ]; then
    exec npx vitest bench "$run_flag" "$@"
fi
exec npx vitest bench "$@"
