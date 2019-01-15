#!/usr/bin/env bash

lerna run build --scope ag-grid-community 
rsync -av --exclude='packages/ag-grid-enterprise/node_modules/ag-grid-community/node_modules/.cache' packages/ag-grid-community packages/ag-grid-enterprise/node_modules
lerna run build --scope ag-grid-enterprise