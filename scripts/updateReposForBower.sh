#!/usr/bin/env bash

rm -rf ag-grid/dist
rm -rf ag-grid-enterprise/dist

cp -r ag-grid/packages/ag-grid-community/dist ag-grid/
cp ag-grid/packages/ag-grid-community/main.* ag-grid/

cp -r ag-grid/packages/ag-grid-enterprise/dist ag-grid-enterprise/
cp ag-grid/packages/ag-grid-enterprise/main.* ag-grid-enterprise/