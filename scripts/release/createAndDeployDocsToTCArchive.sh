#!/usr/bin/env bash

ZIP_PREFIX=`date +%Y%m%d`

cd grid-packages/ag-grid-docs
npx gulp release-archive
cd dist

FILENAME=release_"$ZIP_PREFIX"_v"$ZIP_PREFIX".zip
zip -r ../../../$FILENAME *

cd ../../../

rm -rf /var/www/html/archive
mkdir -p /var/www/html/archive/1.0.0
mv $FILENAME /var/www/html/archive/1.0.0
unzip /var/www/html/archive/1.0.0/$FILENAME -d /var/www/html/archive/1.0.0/

# not really necessary as we don't delete this file
touch /var/www/html/robots.txt
echo "User-agent: *
Disallow: /" > /var/www/html/robots.txt
