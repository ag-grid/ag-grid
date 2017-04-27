#!/usr/bin/env bash

cd ag-grid
#./node_modules/.bin/gulp stylus
#./node_modules/.bin/webpack
gulp webpack

cd ../ag-grid-enterprise
#./node_modules/.bin/webpack
gulp webpack

cd ..