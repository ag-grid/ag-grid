#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIR="$ROOT/scripts/mini-chart-svgs"
cd "$ROOT"
SCRIPT=generate-mini-chart-svgs.mts
if [ "${1:-}" = "--captures" ]; then
    SCRIPT=captures.mts
    shift
fi
TSX_TSCONFIG_PATH=packages/ag-grid-enterprise/tsconfig.lib.json exec node \
    --require "$DIR/css-stub.cjs" \
    --import "$DIR/css-register.mjs" \
    --import tsx \
    "$DIR/$SCRIPT" "$@"
