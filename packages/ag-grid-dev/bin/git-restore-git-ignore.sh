#!/usr/bin/env bash

echo "Switching to $1"

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd $module

    case $module in
        "ag-grid")
            git checkout f9f36ea32ee68d3e7e94008b1c428fecd3815086 .gitignore
            rm -rf dist
            ;;
        "ag-grid-enterprise")
            git checkout 867310332bb0d7a6486954f601559c1dc4dc9f7d .gitignore
            rm -rf dist
            ;;
        "ag-grid-angular")
            git checkout fb3ab3cdb0135f958d78680c30839fa61931659d .gitignore
            rm -rf aot
            rm -rf dist
            ;;
        "ag-grid-react")
            ;;
         "ag-grid-aurelia")
            ;;
         "ag-grid-vue")
            ;;
        "ag-grid-react-example")
            ;;
        "ag-grid-vue-example")
            ;;
        "ag-grid-aurelia-example")
            ;;
        "ag-grid-angular-example")
            ;;
    esac




    cd ..

done