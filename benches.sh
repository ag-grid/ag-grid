#!/usr/bin/env bash
# Runs the behavioural benchmarks via Vitest in a real headless Chromium, bypassing Nx.
# Implementation: scripts/gate/gates/bench.mjs, driven by scripts/gate/main.mjs. Run `./benches.sh --help` for the flags.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/scripts/gate/main.mjs" bench "$@"
