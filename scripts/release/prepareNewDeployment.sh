#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release filename "
    echo "For example: ./scripts/release/deployAgGridRelease.sh release_20191210.zip"
    exit 1
fi

CREDENTIALS_LOCATION=$HOME/$CREDENTIALS_FILE
SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

if [ -z "$CREDENTIALS_LOCATION" ]
then
      echo "\$CREDENTIALS_LOCATION is not set"
      exit 1;
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit 1;
    fi
}

checkFileExists $SSH_LOCATION
checkFileExists $CREDENTIALS_LOCATION

FILENAME=$1

# copy the remote script that will create tmp dirs, unzip the new deployment etc to the upload dir (archives)
curl --netrc-file $CREDENTIALS_LOCATION --ftp-create-dirs -T "./scripts/release/prepareNewDeploymentRemote.sh" ftp://ag-grid.com/
# move prepareNewDeploymentRemote from the archives dir to the root, and make it executable
ssh -i $SSH_LOCATION -p 2022 aggrid@ag-grid.com "mv public_html/archive/prepareNewDeploymentRemote.sh ./"
ssh -i $SSH_LOCATION -p 2022 aggrid@ag-grid.com "chmod +x ./prepareNewDeploymentRemote.sh"

# backup the old public_html, unzip the new release and update permissions etc
# we do this via a remote script as there are many steps and doing so one by one remotely times out occasionally
ssh -i $SSH_LOCATION -p 2022 aggrid@ag-grid.com "cd /home/aggrid/ && ./prepareNewDeploymentRemote.sh $FILENAME"

