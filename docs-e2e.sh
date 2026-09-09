#!/usr/bin/env bash
# Runs the docs Playwright e2e tests, bypassing Nx.
# Implementation: scripts/gate/gates/docs-e2e.mjs, driven by scripts/gate/main.mjs. Run `./docs-e2e.sh --help` for the flags.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/scripts/gate/main.mjs" docs-e2e "$@"
