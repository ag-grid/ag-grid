#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply the version as first parameter and the allowed peer versions as second parameter and then at least one module to export"
    exit 1
fi


echo "Releasing " $1
mkdir $1
cd $1

## for all the modules
declare -a modules=${@:3}

for module in "${modules[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    git clone https://github.com/ceolter/$module.git
    cd $module
    git checkout -b $1

    case $module in
        ##If it depends on ag-grid ONLY
        "ag-grid-ng2-example"|"ag-grid-react-example"|"ag-grid-aurelia-example")
            echo =============================================================================================
            echo "MODULE  $module - THIS WILL GET SETUP AT THE END THROUGH release-prepare-examples $1 $2"
            echo =============================================================================================
            cd ..
            continue
    esac

    ## Replace version number
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' bower.json
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' package.json

    case $module in
        ##If it depends on ag-grid ONLY
        "ag-grid-enterprise"|"ag-grid-react"|"ag-grid-aurelia")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'"/g' package.json
            ## Since we are still NOT publishing to npm use the locally generated npm package
            npm install ../ag-grid/ag-grid-$1.tgz
            ;;
        ##If it depends on ag-grid AND OTHERS. THIS CAN BE REFACTORED FOR SURE!
        "ag-grid-ng2")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'",/g' package.json
            ## Since we are still NOT publishing to npm use the locally generated npm package
            npm install ../ag-grid/ag-grid-$1.tgz
            ;;
    esac

    ## Remove backup files from sed
    rm bower.json.old
    rm package.json.old

    npm i
    npm-install-peers


    case $module in
        "ag-grid-enterprise"|"ag-grid")
            gulp release
            ;;
        "ag-grid-ng2")
            npm run release
            ;;
        "ag-grid-react")
            gulp
            ;;
         "ag-grid-aurelia")
            npm i aurelia-framework
            npm run build
            ;;
    esac


    git add .
    git commit -m "$1"
    git push --set-upstream origin $1

    ## After everything is committed generate the NPM local package
    npm pack

    cd ..
done

cd..
