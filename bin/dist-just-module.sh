#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the parent dir and at least one module to build"
    exit 1
fi


## for all the modules
IFS=' ' read -ra ADDR <<< "${@:2}"
for module in "${ADDR[@]}"
do
    cd "$1/$module"

    case $module in
        "ag-grid-enterprise"|"ag-grid")
            gulp release
            ;;
        "ag-grid-ng2")
            npm run clean-build
            ;;
        "ag-grid-react")
            gulp
            ;;
         "ag-grid-aurelia")
            npm i aurelia-framework
            npm run build
            ;;
         "ag-grid-vue")
            gulp
            ;;
        "ag-grid-docs")
            gulp release
            ;;
        "ag-grid-react-example")
            npm run build-standard
            ;;
        "ag-grid-vue-example")
            npm run build
            ;;
        "ag-grid-aurelia-example")
            gulp
            ;;
        "ag-grid-ng2-example/systemjs_aot")
            npm run clean-build:aot
            ;;
        "ag-grid-ng2-example/webpack")
            npm run build
            ;;
    esac

    cd ../../
done


