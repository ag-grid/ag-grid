#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the parent dir"
    exit 1
fi

build-just-modules $1 "ag-grid" "ag-grid-enterprise" "ag-grid-ng2" "ag-grid-ng2-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example"

