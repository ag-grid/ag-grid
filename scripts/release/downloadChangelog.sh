#!/bin/bash

SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit;
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

checkFileExists $SSH_LOCATION

ssh -i $SSH_LOCATION ceolter@ag-grid.com "cd /home/ceolter/jira_reports && ./getChangelog.sh"
