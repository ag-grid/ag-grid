#!/bin/bash

CALLING_DIR=$(pwd)

MODULE_NAME=`basename $CALLING_DIR`

npx esbuild ./dist/esm/es5/main.js --bundle --platform=node --outfile=$CALLING_DIR/dist/$MODULE_NAME.cjs.js --packages=external
npx esbuild ./dist/esm/es5/main.js --bundle --platform=node --outfile=$CALLING_DIR/dist/$MODULE_NAME.cjs.min.js --packages=external --minify
npx esbuild ./dist/esm/es6/main.mjs --bundle --platform=node --outfile=$CALLING_DIR/dist/$MODULE_NAME.esm.js --format=esm
npx esbuild ./dist/esm/es6/main.mjs --bundle --platform=node --outfile=$CALLING_DIR/dist/$MODULE_NAME.esm.min.js --format=esm --minify

#✔  nx run ag-charts-enterprise:package (11s)
#✔  nx run @ag-grid-community/all-modules:package (20s)
#✔  nx run ag-grid-community:package (1s)
#✔  nx run @ag-grid-enterprise/all-modules:package (43s)
#✔  nx run ag-grid-enterprise:package (827ms)
#


