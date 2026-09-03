#!/usr/bin/env bash
# Pre-commit gate: type-check + lint + spec type-check for every project, in one Nx invocation.
# Implementation: scripts/gate/gates/checks.mjs, driven by scripts/gate/main.mjs. Run `./checks.sh --help` for the flags.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/scripts/gate/main.mjs" checks "$@"
