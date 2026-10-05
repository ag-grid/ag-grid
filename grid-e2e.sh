#!/usr/bin/env bash
# Runs the real-browser Playwright e2e suite in testing/e2e, bypassing Nx for the test run.
# Implementation: scripts/gate/gates/grid-e2e.mjs, driven by scripts/gate/main.mjs. Run `./grid-e2e.sh --help` for the flags.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/scripts/gate/main.mjs" grid-e2e "$@"
