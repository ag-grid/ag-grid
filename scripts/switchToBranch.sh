#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a branch to switch to"
    exit 1
fi

# core projects
git checkout $1

# submodules (i.e. examples)
git submodule foreach git checkout $1
git submodule foreach git pull origin

