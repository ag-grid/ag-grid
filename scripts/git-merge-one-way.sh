#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the source branch that you want to merge"
    echo "For example if you're in master then git-merge-core-one-way.sh b19.1.2 will merge changes in b19.1.2 into master"
    exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Merging $current_branch into $1"
git stash
git pull
git checkout $1
git pull
git checkout $current_branch
git merge $1 --no-commit --no-ff --strategy-option theirs
git stash apply
