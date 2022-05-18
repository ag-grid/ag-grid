#!/bin/bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/uploadReleaseZip.sh 19.1.2"
    exit 1
fi

TIMESTAMP=`date +%Y%m%d`
RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""
FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

CREDENTIALS_LOCATION=$HOME/$CREDENTIALS_FILE
SSH_LOCATION=$HOME/$SSH_FILE

# a few safety checks
if [ -z "$CREDENTIALS_LOCATION" ]
then
      echo "\$CREDENTIALS_LOCATION is not set"
      exit;
fi

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit;
fi

checkFileExists $FILENAME
checkFileExists $CREDENTIALS_LOCATION
checkFileExists $SSH_LOCATION


# upload file - note that this will be uploaded to the archive dir as this is where this ftps home account is
# we'll move this file up one in the next step
curl --netrc-file $CREDENTIALS_LOCATION --ftp-create-dirs -T $FILENAME ftp://ag-grid.com/

# move file from the archives dir to the root
ssh -i $SSH_LOCATION -p 2022 ceolter@ag-grid.com "mv public_html/archive/$FILENAME ./"

