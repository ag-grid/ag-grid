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

# examples
git submodule update --init --recursive
git submodule foreach git checkout $SOURCE_BRANCH
git submodule foreach git pull origin

git checkout -B $NEW_BRANCH

#git push --set-upstream origin $1
git branch --set-upstream $NEW_BRANCH origin/$NEW_BRANCH


# submodules (i.e. examples)
git submodule foreach git checkout -B $NEW_BRANCH
#git submodule foreach git push --set-upstream origin $1
git submodule foreach git branch --set-upstream $NEW_BRANCH origin/$NEW_BRANCH