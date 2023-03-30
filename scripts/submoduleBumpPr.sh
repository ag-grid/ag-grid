#!/bin/sh

set -eu

START_BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u})
HEAD=$(git rev-parse HEAD)
BRANCH=bump-submodules-${HEAD}

git fetch
git stash -u
git checkout -b ${BRANCH}
git pull
git submodule foreach git checkout latest
git submodule foreach git pull origin
git commit -a -m "Submodule bump."
git push --set-upstream origin ${BRANCH}
open https://github.com/ag-grid/ag-grid/pull/new/${BRANCH}
git checkout ${START_BRANCH}
git stash pop
