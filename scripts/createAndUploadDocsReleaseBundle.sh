#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/createAndUploadDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

ZIP_PREFIX=`date +%Y%m%d`

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

FILENAME=release_"$ZIP_PREFIX"_v"$VERSION".zip

./scripts/createDocsReleaseBundle.sh $RAW_VERSION
./scripts/uploadAndUnzipRelease.sh $FILENAME
