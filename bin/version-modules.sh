#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply the version as first parameter and the allowed peer versions as second parameter and then at least one module to update version"
    exit 1
fi


## for all the modules to update versions
IFS=' ' read -ra ADDR <<< "${@:3}"
for module in "${ADDR[@]}"
do
    cd $module

    echo =============================================================================================
    echo "VERSIONING $module"
    echo =============================================================================================
    ## Replace version number
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' bower.json
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' package.json

    ## Remove backup files from sed
    rm bower.json.old
    rm package.json.old

    cd ..
done


IFS=' ' read -ra ADDR2 <<< ""ag-grid-enterprise" "ag-grid-angular" "ag-grid-react" "ag-grid-aurelia" "ag-grid-vue" "ag-grid-polymer""
for module in "${ADDR2[@]}"
do
    cd $module

    echo =============================================================================================
    echo "UPDATING PARENT VERSION IN $module"
    echo =============================================================================================

    case $module in
        ##If it depends on ag-grid ONLY
        "ag-grid-enterprise"|"ag-grid-aurelia")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'"/g' package.json
            ;;
        ##If it depends on ag-grid AND OTHERS. THIS CAN BE REFACTORED FOR SURE!
        "ag-grid-angular"|"ag-grid-vue"|"ag-grid-react")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'",/g' package.json
            ;;
        ##Polymer uses bower
        "ag-grid-polymer")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'"/g' bower.json
            rm bower.json.old
            ;;
    esac

    rm package.json.old

    cd ..
done