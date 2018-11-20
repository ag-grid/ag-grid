#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/createArchiveAndUpload.sh.sh 19.1.2"
    exit 1
fi

VERSION=$1

# store the command output so that we can capture the archive filename
OUTPUT=$(./scripts/createDocsArchiveBundle.sh $VERSION | tee /dev/tty)
ARCHIVE_FILENAME=`echo $OUTPUT | sed 's/.*Archive Created://'`

# $2 is optional skipWarning argument
./scripts/uploadAndUnzipArchive.sh $VERSION $ARCHIVE_FILENAME $2