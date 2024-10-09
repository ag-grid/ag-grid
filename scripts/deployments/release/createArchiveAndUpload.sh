#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createArchiveAndUpload.sh.sh 19.1.2"
    exit 1
fi

VERSION=$1

# store the command output so that we can capture the archive filename
./scripts/deployments/prep_and_archive/createDocsArchiveBundle.sh $VERSION
ARCHIVE_FILENAME="archive_`date +%Y%m%d`_$VERSION.tar.gz"

# $2 is optional skipWarning argument
./scripts/deployments/prep_and_archive/uploadAndUnzipArchive.sh $VERSION $ARCHIVE_FILENAME $2
