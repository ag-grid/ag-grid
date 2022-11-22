#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release filename "
    echo "For example: ./scripts/release/deployAgGridRelease.sh release_20191210.zip"
    exit 1
fi

SSH_LOCATION=$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
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

FILENAME=$1

sed "s/\@HTML_FOLDER_NAME\@/$HTML_FOLDER_NAME/g" ./scripts/release/prepareNewDeploymentRemote.sh > /tmp/prepareNewDeploymentRemote.sh
scp -i $SSH_LOCATION -P $SSH_PORT "/tmp/prepareNewDeploymentRemote.sh" $HOST:$WORKING_DIR_ROOT/prepareNewDeploymentRemote.sh
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST  "chmod +x $WORKING_DIR_ROOT/prepareNewDeploymentRemote.sh"

# backup the old html folder, unzip the new release and update permissions etc
# we do this via a remote script as there are many steps and doing so one by one remotely times out occasionally
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST  "cd $WORKING_DIR_ROOT && ./prepareNewDeploymentRemote.sh $FILENAME"

