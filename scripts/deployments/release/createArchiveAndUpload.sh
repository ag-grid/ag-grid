#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply a grid version, a charts version & a host"
    echo "For example: ./scripts/deployments/release/createArchiveAndUpload.sh 36.1.0 14.1.0 user@host"
    exit 1
fi

VERSION=$1
CHARTS_VERSION=$2
CURRENT_HOST=$3

./scripts/deployments/prep_and_archive/createDocsArchiveBundle.sh $VERSION

./scripts/deployments/prep_and_archive/uploadAndUnzipArchive.sh $VERSION $CHARTS_VERSION $CURRENT_HOST
