#!/usr/bin/env bash

cd ag-grid
gulp webpack

cd ../ag-grid-enterprise
gulp webpack

if [ -d "../ag-grid-angular" ]; then
  cd ../ag-grid-angular
  npm run clean-build
fi

if [ -d "../ag-grid-react" ]; then
  cd ../ag-grid-react
  gulp
fi

if [ -d "../ag-grid-vue" ]; then
  cd ../ag-grid-vue
  gulp
fi

if [ -d "../ag-grid-aurelia" ]; then
  cd ../ag-grid-aurelia
  npm run build
fi
