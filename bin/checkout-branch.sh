#!/usr/bin/env bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply the target dir and the branch name"
    exit 1
fi


echo "Checking out fresh branch in" $1
mkdir $1
cd $1

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-ng2" "ag-grid-ng2-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    git clone https://github.com/ceolter/$module.git
    cd $module
    git checkout -b $2
    git branch --set-upstream-to=origin/$2
    git pull

    npm i
    npm-install-peers

    cd ..

done