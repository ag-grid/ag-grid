#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the version of the branch to delete"
    exit 1
fi


release-just-remove-branch.sh $1 ag-grid-community ag-grid-angular-cli-example ag-grid-aurelia-example ag-grid-react-example ag-grid-vue-example

