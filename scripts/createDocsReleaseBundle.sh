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

cd packages/ag-grid-docs
gulp release
gulp replace-to-cdn
cd dist

zip -r --exclude="dev*" ../../../release_"$ZIP_PREFIX"_v"$VERSION".zip *

cd ../../../

