#!/usr/bin/env bash

if [ "$#" -ne 0 ]
  then
    echo "This script doesnt take params"
    exit 1
fi

current_dir=$(pwd)


## for all the package.json containers replace version number
declare -a subfolders=("ag-grid-angular-example/systemjs_aot" "ag-grid-react-example" "ag-grid-aurelia-example" "ag-grid-vue-example")

for subfolder in "${subfolders[@]}"
do
    echo =============================================================================================
    echo "RELEASING DOCS IN  $subfolder"
    echo =============================================================================================

    cd "$subfolder"

    ## Replace version number
    case $subfolder in
        "ag-grid-angular-example/systemjs_aot")
            gulp build-and-copy-to-ag-docs
            ;;

        "ag-grid-vue-example")
            npm run copy-to-docs
            ;;

        "ag-grid-aurelia-example")
            ;;

        "ag-grid-react-example")
            npm run build-to-docs
            ;;
    esac
    if [ $? -ne 0 ]
    then
        echo "Error releasing docs for: $subfolder. Stopping release-docs.sh"
        exit 1
    fi


    cd "$current_dir"
done