#!/usr/bin/env bash

TARGET_DIRECTORY=$1

ZIP_PREFIX=`date +%Y%m%d`

cd grid-packages/ag-grid-docs
npx gulp release-archive

cd ../../
node scripts/release/patchDocs.js

cd grid-packages/ag-grid-docs

s3 cp dist s3://testing.ag-grid.com/$TARGET_DIRECTORY --recursive
