#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/createAndUploadDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

TIMESTAMP=`date +%Y%m%d`

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

./scripts/createDocsReleaseBundle.sh $RAW_VERSION

BACKUP_DIR=/home/ceolter/release_bak_"$TIMESTAMP"
./scripts/prepareAgGridForRelease.sh $BACKUP_DIR
./scripts/uploadAndUnzipRelease.sh $FILENAME
./scripts/restoreNonVersionedAgGrid.sh $BACKUP_DIR
