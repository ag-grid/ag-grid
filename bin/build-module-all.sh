#!/usr/bin/env bash

if [ $# -ne 0 ]
  then
    echo This does not take params
    exit 1
fi

build-module.sh ag-grid ag-grid-enterprise ag-grid-docs ag-grid-dev ag-grid-angular ag-grid-angular-example ag-grid-react ag-grid-react-example ag-grid-aurelia ag-grid-aurelia-example ag-grid-vue ag-grid-vue-example ag-grid-polymer ag-grid-polymer-example