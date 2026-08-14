#!/usr/bin/env bash
# Stage 3 — move a completed run into the repo for inspection.
# Run folders are immutable evidence: never hand-edit them. The report is always
# regenerated from them, so it can be recomputed with new definitions at any time.
set -euo pipefail

CRITERION="${1:?usage: harvest.sh <criterion> <run>}"
RUN="${2:?usage: harvest.sh <criterion> <run>}"
RUN=$(printf '%02d' "$RUN")

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVALS="$REPO/tmp-llm-onboarding-evals"
WORK="/tmp/grid-eval/$CRITERION-$RUN"
DEST="$EVALS/runs/$CRITERION/$RUN"

[ -d "$WORK" ] || { echo "nothing at $WORK" >&2; exit 1; }

rm -rf "$DEST"
mkdir -p "$DEST"

# package-lock.json is kept deliberately: it records the AG Grid version this run resolved.
rsync -a --exclude node_modules --exclude dist --exclude .vite "$WORK/app/" "$DEST/app/"
cp -R "$WORK/meta/." "$DEST/"

echo "harvested: $DEST"
ls "$DEST"
