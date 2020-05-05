#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release filename "
    echo "For example: ./scripts/release/deployAgGridRelease.sh release_20191210.zip"
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

checkFileExists ~/.ssh/ag_ssh

FILENAME=$1

# backup the old public_html, unzip the new release and update permissions etc
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "./deployAgGridReleaseRemote.sh $FILENAME"
