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


    # BLOCK 1 FOR DEVDEPS AND PEERDEPS FOR AG-GRID
    # This replaces the references in peerDeps and devDeps of ag-grid anywhere they are
    # first we look up all the appearances that have a comma at the back
    sed -i .old -e 's/"ag-grid-community":.*,/"ag-grid-community": "'$2'",/g' package.json

    if [ $? -ne 0 ]
    then
        # Thenwe look up all the appearances that DON'T have a comma at the back
        sed -i .old -e 's/"ag-grid-community":.*/"ag-grid-community": "'$2'"/g' package.json
    fi

    # BLOCK 2 FOR DEVDEPS AND PEERDEPS FOR AG-GRID-ENTERPRISE
    # Same as block 1 but for ag-grid-enterprise
    sed -i .old -e 's/"ag-grid-enterprise":.*,/"ag-grid-enterprise": "'$2'",/g' package.json

    if [ $? -ne 0 ]
    then
        sed -i .old -e 's/"ag-grid-enterprise":.*/"ag-grid-enterprise": "'$2'"/g' package.json
    fi
    
    # BLOCK 3 FOR DEVDEPS AND PEERDEPS FOR AG-GRID-ANGULAR
    sed -i .old -e 's/"ag-grid-angular":.*,/"ag-grid-angular": "'$2'",/g' package.json

    if [ $? -ne 0 ]
    then
        sed -i .old -e 's/"ag-grid-angular":.*/"ag-grid-angular": "'$2'"/g' package.json
    fi
    
    # BLOCK 4 FOR DEVDEPS AND PEERDEPS FOR AG-GRID-REACT
    sed -i .old -e 's/"ag-grid-react":.*,/"ag-grid-react": "'$2'",/g' package.json

    if [ $? -ne 0 ]
    then
        sed -i .old -e 's/"ag-grid-react":.*/"ag-grid-react": "'$2'"/g' package.json
    fi
    
    # BLOCK 5 FOR DEVDEPS AND PEERDEPS FOR AG-GRID-VUE
    sed -i .old -e 's/"ag-grid-vue":.*,/"ag-grid-vue": "'$2'",/g' package.json

    if [ $? -ne 0 ]
    then
        sed -i .old -e 's/"ag-grid-vue":.*/"ag-grid-vue": "'$2'"/g' package.json
    fi
    
    # BLOCK 6 FOR DEVDEPS AND PEERDEPS FOR AG-GRID-AURELIA
    sed -i .old -e 's/"ag-grid-aurelia":.*,/"ag-grid-aurelia": "'$2'",/g' package.json

    if [ $? -ne 0 ]
    then
        sed -i .old -e 's/"ag-grid-aurelia":.*/"ag-grid-aurelia": "'$2'"/g' package.json
    fi

    ## Remove backup files from sed
    rm bower.json.old
    rm package.json.old

    cd ..
done