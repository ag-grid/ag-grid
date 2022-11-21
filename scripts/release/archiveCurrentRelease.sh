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

# archive the current html folder if the archive doesn't already exist (to take account of multiple deployments on the same day)
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST  "if [ -f "$ARCHIVE_FILENAME" ]; then echo \"$ARCHIVE_FILENAME exists - skipping archive\"; else zip -r --exclude=*archive* $WORKING_DIR_ROOT/$ARCHIVE_FILENAME $PUBLIC_HTML_PATH; fi"


