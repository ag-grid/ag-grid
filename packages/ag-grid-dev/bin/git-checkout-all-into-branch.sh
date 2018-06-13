#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the branch name as first parameter"
    exit 1
fi


git-checkout-into-branch.sh $1 "ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example" "ag-grid-polymer" "ag-grid-polymer-example"
