#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply at least one module to build/dist"
    exit 1
fi

current_dir=$(pwd)

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:1}"
for module in "${ADDR[@]}"
do
    cd "$module"

    if [ "$module" != "ag-grid" ]
    then
        npm install "$current_dir/ag-grid/module.tgz"
    fi

    cd "$current_dir"

    build-module.sh $module
    if [ $? -ne 0 ]
    then
        echo "Stopping release-just-branch.sh"
        exit 1
    fi

    dist-just-module.sh $module
    if [ $? -ne 0 ]
    then
        echo "Stopping release-just-branch.sh"
        exit 1
    fi

    cd "$module"

    ## After everything is committed generate the NPM local package
    rm -rf *.tgz
    npm pack
    mv *.tgz module.tgz

    cd "$current_dir"
done