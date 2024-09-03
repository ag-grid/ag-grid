#!/usr/bin/env bash

git merge latest

CONFLICTS=$(git ls-files -u | wc -l)
if [ "$CONFLICTS" -gt 0 ] ; then
   echo "There is a merge conflict. Aborting"
   git merge --abort
   git reset --hard
   exit 1
fi

git commit -am"Merge from latest"
git push
