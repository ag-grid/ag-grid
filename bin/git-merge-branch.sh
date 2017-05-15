#!/usr/bin/env bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply the branch to merge from and the branch to merge into"
    exit 1
fi


git-reset-dist.sh
echo "Merging $1 into $2"

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd $module
    git checkout $2
    git pull
    git checkout $1
    git pull
    git merge $2
    git push
    git checkout $2
    git pull
    git merge $1
    git push
    git checkout $1
    cd ..

done