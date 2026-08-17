#!/usr/bin/env bash
# One run, end to end: build in temp -> move into runs/ -> verify code -> verify browser.
#
# usage: run.sh <suite> <criterion> <run> [port]
set -euo pipefail

SUITE="${1:?usage: run.sh <suite> <criterion> <run> [port]}"
CRITERION="${2:?usage: run.sh <suite> <criterion> <run> [port]}"
RUN="${3:?usage: run.sh <suite> <criterion> <run> [port]}"
PORT="${4:-5601}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$HERE/implement.sh" "$SUITE" "$CRITERION" "$RUN"
"$HERE/verify-code.sh" "$SUITE" "$CRITERION" "$RUN"
PORT="$PORT" "$HERE/verify-browser.sh" "$SUITE" "$CRITERION" "$RUN"
