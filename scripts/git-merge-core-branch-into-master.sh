#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the source branch that you want to merge"
    echo "For example git-merge-branch-into-master.sh b19.1.2 will merge changes in b19.1.2 into master"
    exit 1
fi

git checkout master
./scripts/git-merge-one-way.sh $1

