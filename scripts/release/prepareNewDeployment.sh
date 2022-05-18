#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/prepareNewDeployment.sh 19.1.2"
    exit 1
fi

RAW_VERSION=$1
TIMESTAMP=`date +%Y%m%d`
VERSION=""${RAW_VERSION//./}""
FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

CREDENTIALS_LOCATION=$HOME/$CREDENTIALS_FILE
SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit;
fi

if [ -z "$CREDENTIALS_LOCATION" ]
then
      echo "\$CREDENTIALS_LOCATION is not set"
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
checkFileExists $CREDENTIALS_LOCATION

# copy the remote script that will create tmp dirs, unzip the new deployment etc to the upload dir (archives)
curl --netrc-file $CREDENTIALS_LOCATION --ftp-create-dirs -T "./scripts/release/prepareNewDeploymentRemote.sh" ftp://ag-grid.com/
# move prepareNewDeploymentRemote from the archives dir to the root, and make it executable
ssh -i $SSH_LOCATION -p 2022 ceolter@ag-grid.com "mv public_html/archive/prepareNewDeploymentRemote.sh ./"
ssh -i $SSH_LOCATION -p 2022 ceolter@ag-grid.com "chmod +x ./prepareNewDeploymentRemote.sh"

# backup the old public_html, unzip the new release and update permissions etc
# we do this via a remote script as there are many steps and doing so one by one remotely times out occasionally
ssh -i $SSH_LOCATION -p 2022 ceolter@ag-grid.com "cd /home/ceolter/ && ./prepareNewDeploymentRemote.sh $FILENAME"

