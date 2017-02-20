#!/usr/bin/env bash

cd ../ag-grid
./node_modules/.bin/gulp stylus-watch &
./node_modules/.bin/webpack --watch &
# ./node_modules/.bin/tsc --watch &

cd ../ag-grid-enterprise
./node_modules/.bin/webpack --watch &
# ./node_modules/.bin/tsc --watch &
