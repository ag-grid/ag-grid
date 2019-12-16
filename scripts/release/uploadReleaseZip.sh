#!/bin/bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply a release file to upload"
    echo "For example: ./scripts/release/uploadReleaseZip.sh release_20190222_v2010.zip"
    exit 1
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

FILENAME=$1

checkFileExists $FILENAME
checkFileExists ~/.ssh/ag_ssh
checkFileExists ~/aggrid/.creds

# upload file - note that this will be uploaded to the archive dir as this is where this ftps home account is
# we'll move this file up one in the next step
curl --netrc-file ~/aggrid/.creds --ftp-create-dirs -T $FILENAME ftp://ag-grid.com/

# move file from the archives dir to the root
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mv public_html/archive/$FILENAME ./"

