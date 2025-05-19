#!/bin/bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply a version file to upload, and ssh host"
    echo "For example: ./scripts/deployments/release/uploadReleaseZip.sh release_20190222_v2010.zip"
    exit 1
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit 1;
    fi
}

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""
TIMESTAMP=`date +%Y%m%d`
FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

CURRENT_HOST=$2

SSH_LOCATION=$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

checkFileExists $FILENAME
checkFileExists $SSH_LOCATION

scp -i $SSH_LOCATION -P $SSH_PORT $FILENAME $CURRENT_HOST:$WWW_ROOT_DIR
