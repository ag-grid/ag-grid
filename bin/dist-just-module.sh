#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply at least one module to build"
    exit 1
fi

current_dir=$(pwd)

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:1}"
for module in "${ADDR[@]}"
do
    cd "$module"

    case $module in
        "ag-grid-enterprise"|"ag-grid")
            gulp release
            ;;
        "ag-grid-angular")
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
            npm run build-all
            ;;
        "ag-grid-vue-example")
            npm run build
            ;;
        "ag-grid-aurelia-example")
            npm i
            ;;
        "ag-grid-angular-example/systemjs_aot")
            npm run clean-build:aot
            ;;
        "ag-grid-angular-example/angular-cli")
            npm build --prod
            ;;
        "ag-grid-angular-example/webpack")
            npm run build
            ;;
    esac

    if [ $? -eq 0 ]
    then
        echo "Successfully dist!"
    else
        echo "Could not dist $module"
        exit 1
    fi

    cd "$current_dir"
done


