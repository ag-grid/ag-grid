#!/usr/bin/env bash

if [ "$#" -ne 4 ]
  then
    echo "You must supply in this order: the version to take from ag-grid, version to take from enterprise, version to take from framework, the version of the example"
    exit 1
fi

declare -a subfolders=("ag-grid-polymer-example")

current_dir=$(pwd)
for subfolder in "${subfolders[@]}"
do

    cd "$subfolder"

    echo =============================================================================================
    echo "CHANGING BOWER.JSON IN  $subfolder"
    echo =============================================================================================

    ## Replace version number
    sed -i .old -e 's/.*"version".*/  "version": "'$4'",/g' bower.json
    sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$1'",/g' bower.json
    sed -i .old -e 's/.*"ag-grid-polymer".*/    "ag-grid-polymer": "'$2'",/g' bower.json
    sed -i .old -e 's/.*"ag-grid-enterprise".*/    "ag-grid-enterprise": "'$2'",/g' bower.json
    sed -i .old -e 's/.*"ag-grid-aurelia".*/    "ag-grid-aurelia": "'$3'",/g' bower.json
    sed -i .old -e 's/.*"ag-grid-angular".*/    "ag-grid-angular": "'$3'",/g' bower.json
    sed -i .old -e 's/.*"ag-grid-react".*/    "ag-grid-react": "'$3'"/g' bower.json
    sed -i .old -e 's/.*"ag-grid-vue".*/    "ag-grid-vue": "'$3'",/g' bower.json
    rm bower.json.old


    echo =============================================================================================
    echo "CHANGING PACKAGE.JSON IN  $subfolder"
    echo =============================================================================================

    ## Replace version number
    sed -i .old -e 's/.*"version".*/  "version": "'$4'",/g' package.json
    rm package.json.old

    cd "$current_dir"
done