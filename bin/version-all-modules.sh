#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the version as first parameter and the allowed peer versions as second parameter"
    exit 1
fi


version-modules.sh $1 $2 ag-grid ag-grid-enterprise ag-grid-dev ag-grid-angular ag-grid-angular-example ag-grid-react ag-grid-react-example ag-grid-aurelia ag-grid-aurelia-example ag-grid-vue ag-grid-vue-example ag-grid-polymer ag-grid-polymer-example ag-grid-docs
version-angular-example.sh $2 $2 $2 $1
version-react-example.sh $2 $2 $2 $1
version-vue-example.sh $2 $2 $2 $1
version-aurelia-example.sh $2 $2 $2 $1
version-polymer-example.sh $2 $2 $2 $1