#!/usr/bin/env bash

ZIP_PREFIX=`date +%Y%m%d`

echo "Deploying Docs to Build Server"

if [ ! -d "documentation/ag-grid-docs/dist" ];
then
  echo "documentation/ag-grid-docs/dist does NOT EXIST. Exiting with error."
  exit 1
fi

cd documentation/ag-grid-docs/dist

FILENAME=release_"$ZIP_PREFIX"_v"$ZIP_PREFIX".zip
zip -qr ../../../$FILENAME *

cd ../../../

cp -R /var/www/html/branch-builds /var/www/

rm -rf /var/www/html/*
mv $FILENAME /var/www/html/
unzip -q /var/www/html/$FILENAME -d /var/www/html/

cp -R /var/www/branch-builds /var/www/html/
