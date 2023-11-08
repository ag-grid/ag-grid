#!/usr/bin/env bash

./scripts/release/git-merge-latest.sh

CONFLICTS=$(git ls-files -u | wc -l)
if [ "$CONFLICTS" -gt 0 ] ; then
   echo "There is a merge conflict. Aborting"
   git merge --abort
   exit 1
fi

git add .

git commit -am"Merge from latest"
#git push
