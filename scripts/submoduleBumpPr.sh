#!/bin/sh

set -eu

START_BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u})
REMOTE=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} | sed 's:/: :' | awk '{print $1}')
HEAD=$(git rev-parse HEAD)
BRANCH=bump-submodules-${HEAD}

git fetch ${REMOTE}
git stash -u
git checkout -b ${BRANCH}
git merge ${REMOTE_BRANCH}
# git submodule foreach git checkout latest
# git submodule foreach git pull origin
git commit -a -m "Submodule bump."
git push --set-upstream ${REMOTE} ${BRANCH}
open https://github.com/ag-grid/ag-grid/pull/new/${BRANCH}
git checkout ${START_BRANCH}
git stash pop
