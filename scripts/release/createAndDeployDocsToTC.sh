#!/usr/bin/env bash

ZIP_PREFIX=`date +%Y%m%d`

cd grid-packages/ag-grid-docs
npx gulp release-archive
cd dist

node scripts/release/patchDocs.js

FILENAME=release_"$ZIP_PREFIX"_v"$ZIP_PREFIX".zip
zip -r ../../../$FILENAME *

cd ../../../

rm -rf /var/www/html/*
mv $FILENAME /var/www/html/
unzip /var/www/html/$FILENAME -d /var/www/html/

