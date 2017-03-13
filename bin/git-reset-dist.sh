#!/usr/bin/env bash

if [ "$#" -ne 0 ]
  then
    echo "This doesnt take params"
    exit 1
fi


## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "REVERTING DIST IN  $module"
    echo =============================================================================================

    cd "$module"

    case $module in
        "ag-grid-react-example")
            cd ..
            ;;
        "ag-grid"|"ag-grid-enterprise"|"ag-grid-react"|"ag-grid-vue"|"ag-grid-aurelia")
            git checkout -- dist
            git reset HEAD dist
            git clean -fd dist

            cd ..
            ;;
        "ag-grid-docs")
            git checkout -- src/dist
            git reset HEAD src/dist
            git clean -fd src/dist

            git checkout -- src/aurelia-example/scripts
            git reset HEAD src/aurelia-example/scripts
            git clean -fd src/aurelia-example/scripts

            git checkout -- src/ng2-example/dist
            git reset HEAD src/ng2-example/dist
            git clean -fd src/ng2-example/dist

            cd ..
            ;;
        "ag-grid-angular")
            git checkout -- dist
            git reset HEAD dist
            git clean -fd dist

            git checkout -- aot
            git reset HEAD aot
            git clean -fd aot

            cd ..

            ;;
        "ag-grid-angular-example")
            cd webpack2
            git checkout -- dist
            git reset HEAD dist
            git clean -fd dist

            cd ../

            cd webpack
            git checkout -- dist
            git reset HEAD dist
            git clean -fd dist

            cd ../..
            ;;
    esac




done