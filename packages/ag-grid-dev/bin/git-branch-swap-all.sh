#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the branch name"
    exit 1
fi


echo "Switching to branch" $1

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example" "ag-grid-polymer" "ag-grid-polymer-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd $module
    git checkout $1
    git branch --set-upstream-to=origin/$1

    cd ..
done