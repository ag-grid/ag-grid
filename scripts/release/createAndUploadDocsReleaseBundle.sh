#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createAndUploadDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

TIMESTAMP=`date +%Y%m%d`

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

./scripts/release/createDocsReleaseBundle.sh $RAW_VERSION

BACKUP_DIR=/home/ceolter/release_bak_"$TIMESTAMP"
echo "$FILENAME"
echo "$BACKUP_DIR"

release_20191216_v2211.zip
/home/ceolter/release_bak_20191216

#./scripts/release/prepareAgGridForRelease.sh $BACKUP_DIR
#./scripts/release/uploadAndUnzipRelease.sh $FILENAME
