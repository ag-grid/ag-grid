#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/tagDocsRelease.sh 19.1.2"
    exit 1
fi

TIMESTAMP=`date +%Y%m%d`
RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

TAG="vDocs-$RAW_VERSION-$TIMESTAMP"
git tag -a $TAG -m "Docs Update: Version $VERSION, On: $TIMESTAMP"
git push origin $TAG
