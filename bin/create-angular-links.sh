#!/usr/bin/env bash

# ag
rm -rf ag-grid-enterprise/node_modules/ag-grid
ln -s "./ag-grid" ag-grid-enterprise/node_modules/ag-grid

# angular
rm -rf ag-grid-angular/node_modules/ag-grid
ln -s "./ag-grid" ag-grid-angular/node_modules/ag-grid

rm -rf ag-grid-angular/node_modules/ag-grid-enterprise
ln -s "./ag-grid-enterprise" ag-grid-angular/node_modules/ag-grid-enterprise

# angular examples
rm -rf ag-grid-angular-example/node_modules/ag-grid
ln -s "./ag-grid" ag-grid-angular-example/node_modules/ag-grid

rm -rf ag-grid-angular-example/node_modules/ag-grid-enterprise
ln -s "./ag-grid-enterprise" ag-grid-angular-example/node_modules/ag-grid-enterprise

rm -rf ag-grid-angular-example/node_modules/ag-grid-angular
ln -s "./ag-grid-angular" ag-grid-angular-example/node_modules/ag-grid-angular
