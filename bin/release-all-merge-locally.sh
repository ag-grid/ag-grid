#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the version as first parameter"
    exit 1
fi


release-just-merge-locally $1 $2 "ag-grid" "ag-grid-enterprise" "ag-grid-ng2" "ag-grid-ng2-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example"
