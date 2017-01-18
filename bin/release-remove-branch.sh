#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the version of the branch to delete"
    exit 1
fi


echo "Deleting release branch " $1
cd $1

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-ng2" "ag-grid-ng2-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example")
for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================
    cd $module

    git push origin --delete $1

    cd ..
    rm -rf $module
done
cd ..
rm -rf $1

