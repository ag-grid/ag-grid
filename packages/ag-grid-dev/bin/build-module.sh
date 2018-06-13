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
        "ag-grid")
            bower link
            ;;
        "ag-grid-angular")
            npm install @angular/compiler @angular/compiler @angular/compiler-cli @angular/core rxjs zone.js core-js
            ;;
        "ag-grid-aurelia")
            npm install aurelia-framework
            ;;
        "ag-grid-vue")
            npm install vue
            ;;
        "ag-grid-polymer")
            bower link ag-grid
            bower install
            ;;
    esac

    if [ $? -eq 0 ]
    then
        echo "Successfully build!"
    else
        echo "Could not build $module"
        exit 1
    fi


    npm install

    if [ $? -eq 0 ]
    then
        echo "Successfully build!"
    else
        echo "Could not build $module"
        exit 1
    fi

    cd "$current_dir"
done


