#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createArchiveAndUpload.sh.sh 19.1.2"
    exit 1
fi

VERSION=$1

# store the command output so that we can capture the archive filename
./scripts/release/createDocsArchiveBundle.sh $VERSION
