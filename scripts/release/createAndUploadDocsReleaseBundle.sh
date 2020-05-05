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
./scripts/release/uploadReleaseZip.sh $FILENAME

./scripts/release/archiveCurrentRelease.sh
./scripts/release/prepareNewDeployment.sh $FILENAME
./scripts/release/switchRelease.sh $TIMESTAMP

