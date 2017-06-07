#!/usr/bin/env bash


if [ "$#" -ne 1 ]
  then
    echo "You must supply as 1st parameter the origin branch"
    exit 1
fi



echo "Merging $current_branch into $1"

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd $module
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    git stash
    git checkout $1
    git pull
    git checkout $current_branch
    git pull
    git merge $1
    git stash apply
    cd ..


done