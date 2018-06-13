#!/usr/bin/env bash
current_dir=$(pwd)

remove-dependencies.sh

ln -sf "$current_dir/ag-grid" ag-grid-enterprise/node_modules/ag-grid

ln -sf "$current_dir/ag-grid/dist" ag-grid-docs/src/dist/ag-grid
ln -sf "$current_dir/ag-grid-enterprise/dist" ag-grid-docs/src/dist/ag-grid-enterprise

ln -sf "$current_dir/ag-grid" ag-grid-angular/node_modules/ag-grid
ln -sf "$current_dir/ag-grid-enterprise" ag-grid-angular/node_modules/ag-grid-enterprise

ln -sf "$current_dir/ag-grid" ag-grid-react/node_modules/ag-grid
ln -sf "$current_dir/ag-grid-enterprise" ag-grid-react/node_modules/ag-grid-enterprise

ln -sf "$current_dir/ag-grid" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid
ln -sf "$current_dir/ag-grid-enterprise" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-enterprise
ln -sf "$current_dir/ag-grid-angular" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-angular

ln -sf "$current_dir/ag-grid" ag-grid-react-example/node_modules/ag-grid
ln -sf "$current_dir/ag-grid-enterprise" ag-grid-react-example/node_modules/ag-grid-enterprise
ln -sf "$current_dir/ag-grid-react" ag-grid-react-example/node_modules/ag-grid-react
