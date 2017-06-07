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
            git checkout 71eaabab25ab57d462914fd93fa09bb8aab75f85 .gitignore
            ;;
        "ag-grid-enterprise")
            git checkout 5e7d8ca6f4b58f8f6c9d5dc04f3521c4ecf5eaa5 .gitignore
            ;;
        "ag-grid-angular")
            git checkout de88c686377a1b471fa53bd4b72eea73a9cab482 .gitignore
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
            git checkout 466030e0a286c8a57788c7184be042deedd617ba .gitignore
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
    esac




    cd ..

done