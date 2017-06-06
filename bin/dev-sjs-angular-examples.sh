#!/usr/bin/env bash
current_dir=$(pwd)

dist-just-module.sh ag-grid-angular

cd ag-grid-angular-example/systemjs_aot

npm i

cd ../../

rm -rf ag-grid-angular-example/systemjs_aot/node_modules/ag-grid
rm -rf ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-enterprise
rm -rf ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-angular
ln -s "$current_dir/ag-grid" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid
ln -s "$current_dir/ag-grid-enterprise" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-enterprise
ln -s "$current_dir/ag-grid-angular" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-angular


cd ag-grid-angular-example/systemjs_aot

npm start
