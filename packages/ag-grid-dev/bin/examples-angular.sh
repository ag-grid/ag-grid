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
echo "Preparing examples for angular current dir=$current_dir"

## for all the package.json containers replace version number
declare -a subfolders=("ag-grid-angular-example/systemjs_aot" "ag-grid-angular-example/webpack" "ag-grid-angular-example/angular-cli" "ag-grid-angular-example/webpack2")

for subfolder in "${subfolders[@]}"
do
    echo =============================================================================================
    echo "BUIILDING EXAMPLES"
    echo =============================================================================================

    cd "$subfolder"

    echo "About to install $current_dir/ag-grid/module.tgz"
    npm install "$current_dir/ag-grid/module.tgz"
    echo "About to install $current_dir/ag-grid-enterprise/module.tgz"
    npm install "$current_dir/ag-grid-enterprise/module.tgz"
    echo "About to install $current_dir/ag-grid-angular/module.tgz"
    npm install "$current_dir/ag-grid-angular/module.tgz"

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
echo "SystemJS manual testing -- COPY AND PASTE THIS!!"
echo "cd ag-grid-angular-example/systemjs_aot/"
echo "npm start"
echo "ctrl-c when done (http://localhost:3000)"
echo "npm run clean-build:aot"
echo "npm run lite:aot"
echo "ctrl-c when done (http://localhost:8000)"


echo =============================================================================================
echo =============================================================================================
echo =============================================================================================
echo "Webpack manual testing -- COPY AND PASTE THIS!!"
echo "cd ../webpack"
echo "npm start"
echo "ctrl-c when done http://localhost:8080/"
echo "npm run build"
echo "./node_modules/.bin/http-server dist/"
echo "ctrl-c when done  http://127.0.0.1:8080"


echo =============================================================================================
echo =============================================================================================
echo =============================================================================================
echo "Angular CLI manual testing -- COPY AND PASTE THIS!!"
echo "cd ../angular-cli"
echo "./node_modules/.bin/ng build --prod"
echo "./node_modules/.bin/http-server dist/"
echo "ctrl-c when done (http://127.0.0.1:8080)"
echo "./node_modules/.bin/ng build --aot"
echo "./node_modules/.bin/http-server dist/"
echo "ctrl-c when done http://127.0.0.1:8080"

