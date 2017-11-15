#!/usr/bin/env bash

echo "Switching to $1"

## for all the modules
declare -a modules=("ag-grid" "ag-grid-enterprise" "ag-grid-docs" "ag-grid-dev" "ag-grid-angular" "ag-grid-angular-example" "ag-grid-react" "ag-grid-react-example" "ag-grid-aurelia" "ag-grid-aurelia-example" "ag-grid-vue" "ag-grid-vue-example" "ag-grid-polymer" "ag-grid-polymer-example")

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd $module

    case $module in
        "ag-grid")
            git checkout cb88c31b5fd34ba218b878e13c12a43086affa3b .gitignore
            ;;
        "ag-grid-enterprise")
            git checkout 70be545117e6e1bc814faeb51ac77b736b25d013 .gitignore
            ;;
        "ag-grid-angular")
            git checkout c86aafa7956c3344ca1f5679551f578ec0ecd246 .gitignore
            ;;
        "ag-grid-react")
            git checkout 1e261eb457fda4254e7df1d955a38410aba94b26 .gitignore
            ;;
         "ag-grid-aurelia")
            git checkout 0989599d5bdcd83594895426e5aea1e468ace317 .gitignore
            ;;
         "ag-grid-vue")
            git checkout 70e418eb05226e0ded7bbb99ba1a761e918e1f49 .gitignore
            ;;
        "ag-grid-docs")
            git checkout 5c26d8a4037bdb6a867f4ce642df71ac936548ae .gitignore
            ;;
        "ag-grid-react-example")
            git checkout fc22b657bdebaa9e9e077086c3e7ff9eb71879c8 .gitignore
            ;;
        "ag-grid-vue-example")
            git checkout 25b598fbbd7de0501ca8b97740a4afcf658a6ba5 .gitignore
            ;;
        "ag-grid-aurelia-example")
            git checkout 60bc53cca6ca1605d06e6be9f4eb381e964390d2 .gitignore
            ;;
        "ag-grid-angular-example")
            git checkout ae43ed859ddde99e3c36eee5e37076c316a6ec27 .gitignore
            ;;
        "ag-grid-polymer")
            git checkout 8b6d3a8f43bcb61e1faa14ad62b73f1f9c021188 .gitignore
            ;;
        "ag-grid-polymer-example")
            git checkout 60b72b7681ff8a0b5d9b8d757dd86f473d27d7bc .gitignore
            ;;
    esac




    cd ..

done