#!/usr/bin/env bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply the version as first parameter and the allowed peer versions as second parameter"
    exit 1
fi


build-dist.sh $1 $2 "ag-grid" "ag-grid-enterprise" "ag-grid-dev" "ag-grid-docs" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example" "ag-grid-polymer" "ag-grid-polymer-example"
if [ $? -ne 0 ]
then
    echo "Stopping release-all-branch.sh"
    exit 1
fi

release-prepare-examples.sh $1 $2
if [ $? -ne 0 ]
then
    echo "Stopping release-all-branch.sh"
    exit 1
fi

release-docs.sh $1
if [ $? -ne 0 ]
then
    echo "Stopping release-all-branch.sh"
    exit 1
fi

