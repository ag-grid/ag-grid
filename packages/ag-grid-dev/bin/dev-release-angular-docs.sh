#!/usr/bin/env bash

cd ag-grid-angular-example/systemjs_aot

cd node_modules
rm ag-grid
rm ag-grid-enterprise
rm ag-grid-angular
cd ..

npm install

gulp build-and-copy-to-ag-docs

cd ../..