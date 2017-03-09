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
        "ag-grid-angular")
            npm install @angular/compiler @angular/compiler @angular/compiler-cli @angular/core rxjs zone.js core-js
            ;;
        "ag-grid-aurelia")
            npm install aurelia-framework
            ;;
        "ag-grid-vue")
            npm install vue
            ;;
    esac
    npm install

    cd "$current_dir"
done


