#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the parent dir"
    exit 1
fi

cd $1

cd ag-grid
rm -rf dist
gulp release


cd ../ag-grid-enterprise
rm -rf dist
rm -rf node_modules/ag-grid
npm i "file:../ag-grid"
gulp release


cd ../ag-grid-ng2
rm -rf dist
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-enterprise
npm i "file:../ag-grid"
npm i "file:../ag-grid-enterprise"
npm run clean
npm run build

cd ../ag-grid-ng2-example/systemjs_aot
rm -rf dist
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-ng2
rm -rf node_modules/ag-grid-enterprise
npm i "file:../../ag-grid"
npm i "file:../../ag-grid-enterprise"
npm i "file:../../ag-grid-ng2"
npm run clean
npm run tsc
