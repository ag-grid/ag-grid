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
echo "Preparing examples for vue"

## for all the package.json containers replace version number
declare -a subfolders=("ag-grid-vue-example")

for subfolder in "${subfolders[@]}"
do
    echo =============================================================================================
    echo "BUIILDING EXAMPLES"
    echo =============================================================================================

    cd "$subfolder"


    npm install "$current_dir/ag-grid/module.tgz"
    npm install "$current_dir/ag-grid-enterprise/module.tgz"
    npm install "$current_dir/ag-grid-vue/module.tgz"

    npm-install-peers
    npm i

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
echo "Vue manual testing -- COPY AND PASTE THIS!!"
echo "cd ag-grid-vue-example"
echo "npm run dev"
echo "Navigate to http://localhost:8080 and test - ctrl-c when done"
echo "./node_modules/.bin/http-server ."
echo "Navigate to http://localhost:8080 and test - ctrl-c when done"
