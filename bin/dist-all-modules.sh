#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the parent dir"
    exit 1
fi

dist-just-module.sh $1 ag-grid ag-grid-enterprise ag-grid-dev ag-grid-angular ag-grid-angular-example ag-grid-react ag-grid-react-example ag-grid-aurelia ag-grid-aurelia-example ag-grid-vue ag-grid-vue-example ag-grid-polymer ag-grid-polymer-example