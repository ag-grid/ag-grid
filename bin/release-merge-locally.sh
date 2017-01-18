#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the version as first parameter"
    exit 1
fi


echo "MERGING LOCALLY " $1
cd $1

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-ng2" "ag-grid-ng2-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example")

for module in "${modules[@]}"
do


    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd "$module"
    rm "$module-$1.tgz" -f

    git checkout master
    git merge $1 --no-commit --no-ff

    cd ..
done

