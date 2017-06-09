#!/usr/bin/env bash
current_dir=$(pwd)

rm -rf ag-grid-enterprise/node_modules/ag-grid
ln -s "$current_dir/ag-grid" ag-grid-enterprise/node_modules/ag-grid

rm -rf ag-grid-docs/src/dist/ag-grid
ln -s "$current_dir/ag-grid/dist" ag-grid-docs/src/dist/ag-grid

rm -rf ag-grid-docs/src/dist/ag-grid-enterprise
ln -s "$current_dir/ag-grid-enterprise/dist" ag-grid-docs/src/dist/ag-grid-enterprise

rm -rf ag-grid-angular/node_modules/ag-grid
rm -rf ag-grid-angular/node_modules/ag-grid-enterprise
ln -s "$current_dir/ag-grid" ag-grid-angular/node_modules/ag-grid
ln -s "$current_dir/ag-grid-enterprise" ag-grid-angular/node_modules/ag-grid-enterprise

rm -rf ag-grid-react/node_modules/ag-grid
rm -rf ag-grid-react/node_modules/ag-grid-enterprise
ln -s "$current_dir/ag-grid" ag-grid-react/node_modules/ag-grid
ln -s "$current_dir/ag-grid-enterprise" ag-grid-react/node_modules/ag-grid-enterprise

