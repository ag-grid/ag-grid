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
echo "Creating $FILENAME"
zip -qr ../../../$FILENAME *
# The glob above skips dot-prefixed entries, so add them explicitly:
# - the generated .htaccess (present on staging/production builds)
# - the .well-known directory (e.g. the MCP discovery card, SE-79)
if [ -f .htaccess ]; then
  zip -q ../../../$FILENAME .htaccess
fi
if [ -d .well-known ]; then
  zip -qr ../../../$FILENAME .well-known
fi

cd ../../../

echo "Cleaning current grid staging"
rm -rf /var/www/html/*
mv $FILENAME /var/www/html/

echo "Unzipping new grid staging"
unzip -q /var/www/html/$FILENAME -d /var/www/html/
