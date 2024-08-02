#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply a source branch and target branch to switch to"
    exit 1
fi

SOURCE_BRANCH=$1
NEW_BRANCH=$2

# core projects
git checkout $SOURCE_BRANCH
git pull

git checkout -B $NEW_BRANCH
