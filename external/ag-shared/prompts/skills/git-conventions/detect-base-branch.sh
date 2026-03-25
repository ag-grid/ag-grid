#!/usr/bin/env bash
# Detect the correct base branch for a PR by comparing merge-base distances.
#
# Iterates all origin/bX.Y.Z release branches (newest version first) and
# compares the distance from HEAD to each branch's merge-base.  When the
# distance increases from one branch to the next older one, the previous
# (newer) branch is the parent.
#
# Output:
#   BASE_BRANCH=<branch>   — the detected base (e.g. b13.2.0 or latest)
#
# Usage:
#   source detect-base-branch.sh   # sets BASE_BRANCH
#   — or —
#   eval "$(bash detect-base-branch.sh)"

set -euo pipefail

git fetch origin --quiet

LATEST_MB=$(git merge-base origin/latest HEAD 2>/dev/null) || LATEST_MB=""
if [ -n "$LATEST_MB" ]; then
  LATEST_DIST=$(git rev-list --count "$LATEST_MB..HEAD")
else
  LATEST_DIST=999999
fi
echo "latest $LATEST_DIST"

PREV_DIST=""
PREV_REF=""
PARENT=""

# List all release branches sorted by version number, newest first.
# No date cutoff — active release branches may be older than expected.
for ref in $(git branch -r --list 'origin/b[0-9]*' --sort=-version:refname \
    --format='%(refname:short)'); do
  mb=$(git merge-base "$ref" HEAD 2>/dev/null) || continue
  count=$(git rev-list --count "$mb..HEAD")
  echo "$ref $count"

  if [ -n "$PREV_DIST" ] && [ "$count" -gt "$PREV_DIST" ] && [ "$PREV_DIST" -lt "$LATEST_DIST" ]; then
    PARENT="$PREV_REF"
    echo "PARENT: $PARENT (distance $PREV_DIST)"
    break
  fi

  PREV_DIST="$count"
  PREV_REF="$ref"
done

# Fallback: if we iterated candidates but the loop ended without finding an
# increase (e.g. only one candidate), check the last candidate against latest.
if [ -z "$PARENT" ] && [ -n "$PREV_REF" ] && [ "$PREV_DIST" -lt "$LATEST_DIST" ]; then
  PARENT="$PREV_REF"
  echo "PARENT: $PARENT (distance $PREV_DIST)"
fi

if [ -n "$PARENT" ]; then
  BASE_BRANCH="${PARENT#origin/}"
else
  BASE_BRANCH="latest"
fi

echo "BASE_BRANCH=$BASE_BRANCH"
