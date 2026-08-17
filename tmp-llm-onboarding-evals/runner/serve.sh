#!/usr/bin/env bash
# Run a harvested app so you can play with it in a browser.
#
# node_modules is not kept in the run folder, so this installs it in place on first use.
# Edits to the run folder take effect immediately — the app is served from where it lives.
#
# usage: serve.sh <suite> <criterion> <run> [port]
set -euo pipefail

SUITE="${1:?usage: serve.sh <suite> <criterion> <run> [port]}"
CRITERION="${2:?usage: serve.sh <suite> <criterion> <run> [port]}"
RUN="${3:?usage: serve.sh <suite> <criterion> <run> [port]}"
RUN=$(printf '%02d' "$RUN")
PORT="${4:-5601}"

EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$EVALS/suites/$SUITE/runs/$CRITERION/$RUN/app"

[ -d "$APP" ] || { echo "no harvested app at $APP" >&2; exit 1; }

cd "$APP"
if [ ! -d node_modules ]; then
    echo "installing dependencies in $APP ..."
    npm install --no-audit --no-fund > /dev/null 2>&1
fi

echo "serving $CRITERION/$RUN on http://localhost:$PORT/"
echo "editing $APP/src will hot-reload"
exec npx vite --port "$PORT" --strictPort
