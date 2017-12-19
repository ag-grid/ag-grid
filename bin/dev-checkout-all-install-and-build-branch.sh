#!/usr/bin/env bash

set -e

if [ "$#" -ne 1 ]
  then
    echo "You must supply the branch name as first parameter"
    exit 1
fi

git-checkout-all-into-existing-branch.sh $1
cd latest
dev-npm-install-all.sh
dev-build-and-install-once.sh
