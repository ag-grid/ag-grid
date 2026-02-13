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
#   ./behave.sh --update                  # Update snapshots

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR/testing/behavioural"

exec npx vitest "$@"
