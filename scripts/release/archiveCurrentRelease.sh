#!/usr/bin/env bash

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit 1;
    fi
}

SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

checkFileExists $SSH_LOCATION

TIMESTAMP=`date +%Y%m%d`
ARCHIVE_FILENAME="agGridCom_$TIMESTAMP.zip"

# archive the current public_html if the archive doesn't already exist (to take account of multiple deployments on the same day)
ssh -i $SSH_LOCATION -p 2022 aggrid@ag-grid.com "if [ -f "$ARCHIVE_FILENAME" ]; then echo \"$ARCHIVE_FILENAME exists - skipping archive\"; else zip -r --exclude=*archive* $ARCHIVE_FILENAME public_html; fi"


