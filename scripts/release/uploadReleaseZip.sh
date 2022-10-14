#!/bin/bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply a version file to upload"
    echo "For example: ./scripts/release/uploadReleaseZip.sh release_20190222_v2010.zip"
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

CREDENTIALS_LOCATION=$HOME/$CREDENTIALS_FILE
SSH_LOCATION=$HOME/$SSH_FILE

# a few safety checks
if [ -z "$CREDENTIALS_LOCATION" ]
then
      echo "\$CREDENTIALS_LOCATION is not set"
      exit 1;
fi

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

checkFileExists $FILENAME
checkFileExists $CREDENTIALS_LOCATION
checkFileExists $SSH_LOCATION


# upload file - note that this will be uploaded to the archive dir as this is where this ftps home account is
# we'll move this file up one in the next step
curl --netrc-file $CREDENTIALS_LOCATION --ftp-create-dirs -T $FILENAME ftp://ag-grid.com/

# move file from the archives dir to the root
ssh -i $SSH_LOCATION -p 2022 aggrid@ag-grid.com "mv public_html/archive/$FILENAME ./"

