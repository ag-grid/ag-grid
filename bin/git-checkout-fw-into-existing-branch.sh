#!/usr/bin/env bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply the branch name as first parameter and the framework as the second (ie angular, react, polymer etc)"
    exit 1
fi

branch=$1
framework=$2

projects=("ag-grid" "ag-grid-enterprise" "ag-grid-$framework" "ag-grid-$framework-example")

git-checkout-into-existing-branch.sh $branch ${projects[@]}
