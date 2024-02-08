#!/usr/bin/env bash

./scripts/release/git-merge-one-way.sh latest

git checkout HEAD -- scripts/mergeFromLatestAndCommit.sh

git add grid-examples/ag-grid-angular-cli-example
git add grid-examples/ag-grid-angular-cli-package-example
git add grid-examples/ag-grid-react-example
git add grid-examples/ag-grid-react-package-example
git add grid-examples/ag-grid-solid-example
git add grid-examples/ag-grid-solid-package-example
git add grid-examples/ag-grid-vue-example
git add grid-examples/ag-grid-vue-package-example
git add grid-examples/ag-grid-vue3-example
git add grid-examples/ag-grid-vue3-package-example

CONFLICTS=$(git ls-files -u | wc -l)
if [ "$CONFLICTS" -gt 0 ] ; then
   echo "There is a merge conflict. Aborting"
   git merge --abort
   git reset --hard
   exit 1
fi

git commit -am"Merge from latest"
git push
