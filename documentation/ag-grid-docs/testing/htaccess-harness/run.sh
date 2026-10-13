#!/usr/bin/env bash
#
# Local Apache behavioural harness for the generated .htaccess files (grid, charts, studio).
# Thin wrapper so the Nx target (test:htaccess) keeps calling `bash .../run.sh`; the harness itself
# is harness.mjs. See README.md for the options (CHARTS_REPO/CHARTS_REF, STUDIO_REPO/STUDIO_REF,
# GRID_REF, SKIP_CHARTS/SKIP_STUDIO, PORT, KEEP_RUNNING, VERBOSE, --env staging|production).
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
# The harness's own verdict rules first (known-fail matching, coverage, generator aborts): a
# probe run is only as trustworthy as the code that judges it.
node --test --test-reporter=dot "$dir/lib/*.test.mjs" "$dir/generators/*.test.mjs"
exec node "$dir/harness.mjs" "$@"
