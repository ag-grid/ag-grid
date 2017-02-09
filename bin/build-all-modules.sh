#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the parent dir"
    exit 1
fi

build-just-module.sh $1 ag-grid ag-grid-enterprise ag-grid-dev ag-grid-ng2 ag-grid-ng2-example ag-grid-react ag-grid-react-example ag-grid-aurelia ag-grid-aurelia-example ag-grid-vue ag-grid-vue-example