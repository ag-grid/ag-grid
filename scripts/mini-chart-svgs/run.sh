#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIR="$ROOT/scripts/mini-chart-svgs"
cd "$ROOT"
TSX_TSCONFIG_PATH=packages/ag-grid-enterprise/tsconfig.lib.json exec node \
    --require "$DIR/css-stub.cjs" \
    --import "$DIR/css-register.mjs" \
    --import tsx \
    "$DIR/generate-mini-chart-svgs.mts" "$@"
