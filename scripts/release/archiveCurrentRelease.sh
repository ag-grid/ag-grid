#!/usr/bin/env bash

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

checkFileExists ~/.ssh/ag_ssh

TIMESTAMP=`date +%Y%m%d`

ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "zip -r --exclude=*archive* agGridCom_$TIMESTAMP.zip public_html"


