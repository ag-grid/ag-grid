#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

echo "Starting Archive Docs Bundle Process"
cd grid-packages/ag-grid-docs
npm run clean

echo "Gatsby Archive Package"
cd documentation
npm run clean
GATSBY_HOST=www.ag-grid.com GATSBY_ROOT_DIRECTORY="/archive/${RAW_VERSION}" npm run package
cd ..

echo "Building Docs Archive"
npx gulp release-archive
cd ../../

ARCHIVE_FILENAME="archive_`date +%Y%m%d`_$RAW_VERSION.tar"
rm $ARCHIVE_FILENAME

echo "Adding robots.txt and github version info"
node scripts/release/patchDocs.js

cd grid-packages/ag-grid-docs/dist
tar -cvf ../../../$ARCHIVE_FILENAME .
cd ../../../

echo "Gzipping $ARCHIVE_FILENAME"
gzip --force $ARCHIVE_FILENAME

echo "Archive Created: $ARCHIVE_FILENAME.gz"

