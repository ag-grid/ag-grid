#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the version as first parameter and the allowed peer versions as second parameter"
    exit 1
fi


version-modules.sh $1 $2 ag-grid-community ag-grid-enterprise ag-grid-dev ag-grid-angular ag-grid-react ag-grid-aurelia ag-grid-vue ag-grid-docs ag-grid-angular-cli-example ag-grid-aurelia-example ag-grid-react-example ag-grid-vue-example
#version-angular-example.sh $2 $2 $2 $1
#version-react-example.sh $2 $2 $2 $1
#version-vue-example.sh $2 $2 $2 $1
#version-aurelia-example.sh $2 $2 $2 $1
#version-polymer-example.sh $2 $2 $2 $1