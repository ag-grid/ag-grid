#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the target dir"
    exit 1
fi


echo "Checking out fresh branch in" $1
mkdir $1
cd $1

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example" "ag-grid-polymer" "ag-grid-polymer-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    git clone https://github.com/ag-grid/$module.git

    echo =============================================================================================
    echo "CHECKING OUT IN PROCESS.."
    echo =============================================================================================
done