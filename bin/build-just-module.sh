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
    cd "$module"

    case $module in
        "ag-grid-ng2")
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

    cd ../
done


