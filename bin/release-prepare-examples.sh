#!/usr/bin/env bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply the version and the allowed version"
    exit 1
fi

cd $1
current_dir=$(pwd)


echo =============================================================================================
echo =============================================================================================
echo =============================================================================================
echo "Preparing examples for " $1

## for all the package.json containers replace version number
declare -a subfolders=("ag-grid-angular-example/systemjs_aot" "ag-grid-angular-example/webpack" "ag-grid-angular-example/angular-cli" "ag-grid-react-example" "ag-grid-aurelia-example" "ag-grid-vue-example")

for subfolder in "${subfolders[@]}"
do
    echo =============================================================================================
    echo "CHANGING PACKAGE.JSON IN  $subfolder"
    echo =============================================================================================

    cd "$subfolder"

    ## Replace version number
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' package.json
    sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'",/g' package.json
    sed -i .old -e 's/.*"ag-grid-enterprise".*/    "ag-grid-enterprise": "'$2'",/g' package.json
    sed -i .old -e 's/.*"ag-grid-aurelia".*/    "ag-grid-aurelia": "'$2'",/g' package.json
    sed -i .old -e 's/.*"ag-grid-angular".*/    "ag-grid-angular": "'$2'",/g' package.json
    sed -i .old -e 's/.*"ag-grid-react".*/    "ag-grid-react": "'$2'"/g' package.json
    sed -i .old -e 's/.*"ag-grid-vue".*/    "ag-grid-vue": "'$2'",/g' package.json

    rm package.json.old

    npm install "$current_dir/ag-grid/module.tgz"
    npm install "$current_dir/ag-grid-enterprise/module.tgz"


    case $subfolder in
        "ag-grid-angular-example/systemjs_aot"|"ag-grid-angular-example/webpack"|"ag-grid-angular-example/angular-cli")
            npm install "$current_dir/ag-grid-angular/module.tgz"
            ;;
        "ag-grid-react-example")
            npm install "$current_dir/ag-grid-react/module.tgz"
            ;;
        "ag-grid-aurelia-example")
            npm install "$current_dir/ag-grid-aurelia/module.tgz"
            ;;
        "ag-grid-vue-example")
            npm install "$current_dir/ag-grid-vue/module.tgz"
            ;;
    esac


    npm-install-peers
    npm i

    cd "$current_dir"
    cd ..

    dist-just-module.sh $1 $subfolder
    if [ $? -ne 0 ]
    then
        echo "Stopping release-prepare-examples.sh"
        exit 1
    fi

    cd "$current_dir"
done




## for all the modules commit the change
declare -a modules=("ag-grid-angular-example" "ag-grid-react-example" "ag-grid-aurelia-example" "ag-grid-vue")

for module in "${modules[@]}"
do
    cd $module

    git add .
    git commit -m "$1"
    git push --set-upstream origin $1

    cd ..
done