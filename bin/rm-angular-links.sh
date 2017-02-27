#!/usr/bin/env bash
current_dir=$(pwd)

# ag
rm ag-grid-enterprise/node_modules/ag-grid

# angular
rm ag-grid-angular/node_modules/ag-grid
rm ag-grid-angular/node_modules/ag-grid-enterprise

# angular examples
rm ag-grid-angular-example/node_modules/ag-grid
rm ag-grid-angular-example/node_modules/ag-grid-enterprise
rm ag-grid-angular-example/node_modules/ag-grid-angular
