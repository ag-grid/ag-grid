#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply the parent dir, current version and at least one module to build"
    exit 1
fi

#first run pack
cd $1/ag-grid
rm -rf dist
rm -rf ag-grid-$2.tgz
cd ../..
dist-just-module.sh $1 ag-grid
cd $1/ag-grid
npm pack
cd ../..

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:3}"
for module in "${ADDR[@]}"
do
    cd "$1/$module"

    rm -rf node_modules/ag-grid
    npm install ../ag-grid/ag-grid-$2.tgz

    cd ../../
    dist-just-module.sh $1 $module
done

rm -rf $1/ag-grid/ag-grid-$2.tgz


