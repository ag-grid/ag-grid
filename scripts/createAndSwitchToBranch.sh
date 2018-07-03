#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a branch to switch to"
    exit 1
fi

# core projects
git checkout latest
git submodule update --init --recursive
git submodule foreach git checkout latest

git checkout -B $1

git push --set-upstream origin $1

# submodules (i.e. examples)
git submodule foreach git checkout -B $1
git submodule foreach git push --set-upstream origin $1