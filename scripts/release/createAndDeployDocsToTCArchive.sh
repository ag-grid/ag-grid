#!/bin/bash

ZIP_PREFIX=`date +%Y%m%d`

cd grid-packages/ag-grid-docs
npx gulp release-archive
cd dist

FILENAME=release_"$ZIP_PREFIX"_v"$ZIP_PREFIX".zip
zip -r ../../../$FILENAME *

cd ../../../

VERSION=`grep -Po '"version":.*?[^\\\]",' package.json | sed 's/[\"|\,|version|\:| ]//g'`

rm -rf /var/www/html/archive/$VERSION
mkdir -p /var/www/html/archive/$VERSION
mv $FILENAME /var/www/html/archive/$VERSION
unzip /var/www/html/archive/$VERSION/$FILENAME -d /var/www/html/archive/$VERSION/

# not really necessary as we don't delete this file
touch /var/www/html/robots.txt
echo "User-agent: *
Disallow: /" > /var/www/html/robots.txt
