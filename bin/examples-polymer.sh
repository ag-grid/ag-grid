#!/usr/bin/env bash

if [ "$#" -ne 0 ]
  then
    echo "This doesnt take params"
    exit 1
fi

current_dir=$(pwd)

echo =============================================================================================
echo =============================================================================================
echo =============================================================================================
echo "Preparing examples for polymer"

## for all the package.json containers replace version number
declare -a subfolders=("ag-grid-polymer-example")

for subfolder in "${subfolders[@]}"
do
    echo =============================================================================================
    echo "BUIILDING EXAMPLES"
    echo =============================================================================================

    cd "$subfolder"
    cd ../ag-grid-enterprise
    bower link
    cd ../ag-grid-polymer
    bower link
    cd ../ag-grid-polymer-example

    npm i
    bower install

    bower link ag-grid
    bower link ag-grid-enterprise
    bower link ag-grid-polymer
    
    cd "$current_dir"
    dist-just-module.sh $subfolder
    if [ $? -ne 0 ]
    then
        echo "Stopping release-prepare-examples.sh"
        exit 1
    fi

    cd "$current_dir"
done

echo =============================================================================================
echo =============================================================================================
echo =============================================================================================
echo "Polymer manual testing -- COPY AND PASTE THIS!!"
echo "cd ag-grid-polymer-example"
echo "npm start"
echo "Navigate to http://localhost:8080 and test - ctrl-c when done"
