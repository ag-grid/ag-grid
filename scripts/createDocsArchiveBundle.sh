#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/createDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

ZIP_PREFIX=`date +%Y%m%d`

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

echo "Building Docs Release"
cd packages/ag-grid-docs
gulp release
cd ../../

OUTPUT=$(node scripts/createDocsArchiveBundle.js $RAW_VERSION | tee /dev/tty)
ARCHIVE_FILENAME=`echo $OUTPUT | sed 's/.*Archive Complete://'`

echo "Archive Created: $ARCHIVE_FILENAME"