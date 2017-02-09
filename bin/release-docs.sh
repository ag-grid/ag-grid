#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the parent directory as the first param"
    exit 1
fi

cd $1
current_dir=$(pwd)


## for all the package.json containers replace version number
declare -a subfolders=("ag-grid-ng2-example/systemjs_aot" "ag-grid-react-example" "ag-grid-aurelia-example" "ag-grid-vue-example")

for subfolder in "${subfolders[@]}"
do
    echo =============================================================================================
    echo "RELEASING DOCS IN  $subfolder"
    echo =============================================================================================

    cd "$subfolder"

    ## Replace version number
    case $subfolder in
        "ag-grid-ng2-example/systemjs_aot")
            gulp build-and-copy-to-ag-docs
            ;;

        "ag-grid-vue-example")
            npm run copy-to-docs
            ;;

        "ag-grid-aurelia-example")
            npm run copy-to-ag-docs
            ;;

        "ag-grid-react-example")
            cp dist/bundle.js ../ag-grid-docs/src/best-react-data-grid/bundle.js
    esac


    cd "$current_dir"
done

cd ..