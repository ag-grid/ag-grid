#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version"
    echo "For example: ./scripts/release/deployAgGridRelease.sh 28.0.0"
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

VERSION=$1

# replace tokens in prepareNewDeploymentRemote.sh with env variables - we'll transfer the newly tokenised file to prod
echo "cat ./scripts/release/prepareNewDeploymentRemote.sh | sed \"s/\@HTML_FOLDER_NAME\@/$HTML_FOLDER_NAME/g\" | sed \"s/\@WORKING_DIR_ROOT\@/$WORKING_DIR_ROOT/g\" > /tmp/prepareNewDeploymentRemote.sh"
cat ./scripts/release/prepareNewDeploymentRemote.sh | sed "s/\@HTML_FOLDER_NAME\@/$HTML_FOLDER_NAME/g"  | sed "s/\@WORKING_DIR_ROOT\@/$WORKING_DIR_ROOT/g" > /tmp/prepareNewDeploymentRemote.sh

scp -i $SSH_LOCATION -P $SSH_PORT "/tmp/prepareNewDeploymentRemote.sh" $HOST:$WORKING_DIR_ROOT/prepareNewDeploymentRemote.sh
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST  "chmod +x $WORKING_DIR_ROOT/prepareNewDeploymentRemote.sh"

# backup the old html folder, unzip the new release and update permissions etc
# we do this via a remote script as there are many steps and doing so one by one remotely times out occasionally
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST  "cd $WORKING_DIR_ROOT && ./prepareNewDeploymentRemote.sh $VERSION"

