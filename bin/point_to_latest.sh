#!/usr/bin/env bash

rm -rf node_modules/ag-grid
ln -s "$AG_HOME_LATEST/ag-grid" node_modules/ag-grid

rm -rf node_modules/ag-grid-enterprise
ln -s "$AG_HOME_LATEST/ag-grid-enterprise" node_modules/ag-grid-enterprise

rm -rf node_modules/ag-grid-angular
ln -s "$AG_HOME_LATEST/ag-grid-angular" node_modules/ag-grid-angular