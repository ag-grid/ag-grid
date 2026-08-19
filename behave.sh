#!/usr/bin/env bash
# Runs the merged unit-test suite (package unit tests + the behavioural black-box suite) via Vitest, bypassing Nx.
# Implementation: scripts/gate/gates/behave.mjs, driven by scripts/gate/main.mjs. Run `./behave.sh --help` for the flags.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/scripts/gate/main.mjs" behave "$@"
