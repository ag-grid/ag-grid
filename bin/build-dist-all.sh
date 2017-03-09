#!/usr/bin/env bash

if [ "$#" -ne 0 ]
  then
    echo "This does not take params"
    exit 1
fi

build-dist.sh ag-grid ag-grid-enterprise ag-grid-angular ag-grid-react ag-grid-aurelia ag-grid-vue