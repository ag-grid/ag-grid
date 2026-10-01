#!/usr/bin/env bash
#
# Local Apache behavioural harness for the generated .htaccess files (grid, charts, studio).
# Thin wrapper so the Nx target (test:htaccess) keeps calling `bash .../run.sh`; the harness itself
# is harness.mjs. See README.md for the options (CHARTS_REPO/CHARTS_REF, STUDIO_REPO/STUDIO_REF,
# GRID_REF, SKIP_CHARTS/SKIP_STUDIO, PORT, KEEP_RUNNING, VERBOSE, --env staging|production).
set -euo pipefail
exec node "$(cd "$(dirname "$0")" && pwd)/harness.mjs" "$@"
