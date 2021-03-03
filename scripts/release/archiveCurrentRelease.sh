#!/usr/bin/env bash

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit;
fi

checkFileExists $SSH_LOCATION

TIMESTAMP=`date +%Y%m%d`

ssh -i $SSH_LOCATION ceolter@ag-grid.com "zip -r --exclude=*archive* agGridCom_$TIMESTAMP.zip public_html"


