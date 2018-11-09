#!/usr/bin/env bash

if [ ! -d "../ag-grid-enterprise" ]; then
    echo "ag-grid-enterprise must exist as a sibling directory/project"
    exit 1
fi

cp -r packages/ag-grid-enterprise/dist ../ag-grid-enterprise/
cp packages/ag-grid-enterprise/main.d.ts ../ag-grid-enterprise/
cp packages/ag-grid-enterprise/main.js ../ag-grid-enterprise/
cp packages/ag-grid-enterprise/package.json ../ag-grid-enterprise/
cp packages/ag-grid-enterprise/bower.json ../ag-grid-enterprise/

