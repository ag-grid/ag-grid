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
IFS=' ' read -ra ADDR <<< "${@:3}"
for module in "${ADDR[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================
    case $module in
        ##Examples
        "ag-grid-angular-example"|"ag-grid-react-example"|"ag-grid-aurelia-example"|"ag-grid-vue-example")
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
        ##Examples
        "ag-grid-dev"|"ag-grid-docs")
            echo =============================================================================================
            echo "MODULE  $module - WE ARE DONE WITH THESE ONES FOR THE TIME BEING"
            echo =============================================================================================
            cd ..
            continue
    esac

    case $module in
        ##If it depends on ag-grid ONLY
        "ag-grid-enterprise"|"ag-grid-react"|"ag-grid-aurelia")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'"/g' package.json
            ## Since we are still NOT publishing to npm use the locally generated npm package
            npm install ../ag-grid/module.tgz
            ;;
        ##If it depends on ag-grid AND OTHERS. THIS CAN BE REFACTORED FOR SURE!
        "ag-grid-angular"|"ag-grid-vue")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'",/g' package.json
            ## Since we are still NOT publishing to npm use the locally generated npm package
            npm install ../ag-grid/module.tgz
            ;;
    esac

    ## Remove backup files from sed
    rm bower.json.old
    rm package.json.old

    cd ../..
    build-module.sh $1 $module
    dist-just-module.sh $1 $module
    if [ $? -ne 0 ]
    then
        echo "Stopping release-just-branch.sh"
        exit 1
    fi
    cd "$1/$module"

    git add .
    git commit -m "$1"
    git push --set-upstream origin $1

    ## After everything is committed generate the NPM local package
    npm pack
    mv *.tgz module.tgz

    cd ..
done

cd ..
