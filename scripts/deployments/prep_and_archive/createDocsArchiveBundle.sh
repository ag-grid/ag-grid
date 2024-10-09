#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/deployments/release/createDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

ARCHIVE_FILENAME="archive_`date +%Y%m%d`_$RAW_VERSION.tar"
rm $ARCHIVE_FILENAME

cd documentation/ag-grid-docs/dist
tar -cvf ../../../$ARCHIVE_FILENAME .
cd ../../../

echo "Gzipping $ARCHIVE_FILENAME"
gzip --force $ARCHIVE_FILENAME

echo "Archive Created: $ARCHIVE_FILENAME.gz"

