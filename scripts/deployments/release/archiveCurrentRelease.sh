#!/usr/bin/env bash

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit 1;
    fi
}

SSH_LOCATION=$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

checkFileExists $SSH_LOCATION

TIMESTAMP=`date +%Y%m%d`
ARCHIVE_FILENAME="agGridCom_$TIMESTAMP"

# archive the current html folder if the archive doesn't already exist (to take account of multiple deployments on the same day)
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST  "if [ -f "$WWW_ROOT_DIR/$ARCHIVE_FILENAME" ]; then echo \"$WWW_ROOT_DIR/$ARCHIVE_FILENAME exists - skipping archive\"; else cd $WWW_ROOT_DIR && rsync -qav --exclude /archive --exclude /charts html/ $ARCHIVE_FILENAME; fi"


