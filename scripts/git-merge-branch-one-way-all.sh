#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply as 1st parameter the origin branch"
    exit 1
fi

git-merge-branch-one-way.sh $1 ag-grid-community ag-grid-angular-cli-example ag-grid-aurelia-example ag-grid-react-example ag-grid-vue-example