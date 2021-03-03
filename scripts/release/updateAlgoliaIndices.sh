#!/usr/bin/env bash

cd grid-packages/ag-grid-docs/documentation
echo "Update Algolia"
node ./update-algolia.js
cd ../../../

