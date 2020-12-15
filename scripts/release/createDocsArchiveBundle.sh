#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

ZIP_PREFIX=`date +%Y%m%d`
RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

echo "Starting Archive Docs Bundle Process"
cd grid-packages/ag-grid-docs
rm -rf dist

echo "Gatsby Archive Package"
cd documentation
GATSBY_HOST=www.ag-grid.com GATSBY_ROOT_DIRECTORY="/archive/$RAW_VERSION" npm run package
cd ..

echo "Building Docs Archive"
npx gulp release-archive
cd ../../

OUTPUT=$(node scripts/release/createDocsArchiveBundle.js $RAW_VERSION | tee /dev/tty)
ARCHIVE_FILENAME=`echo $OUTPUT | sed 's/.*Archive Complete://'`

echo "Archive Created: $ARCHIVE_FILENAME"

