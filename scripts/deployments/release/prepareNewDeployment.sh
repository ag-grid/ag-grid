#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version"
    echo "For example: ./scripts/deployments/release/prepareNewDeployment.sh 28.0.0"
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
sed "s#\@GRID_ROOT_DIR\@#$GRID_ROOT_DIR#g" ./scripts/deployments/release/prepareNewDeploymentRemote.sh | sed "s#\@WWW_ROOT_DIR\@#$WWW_ROOT_DIR#g" > /tmp/prepareNewDeploymentRemote.sh

scp -i $SSH_LOCATION -P $SSH_PORT "/tmp/prepareNewDeploymentRemote.sh" $HOST:$WWW_ROOT_DIR/prepareNewDeploymentRemote.sh
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST "chmod +x $WWW_ROOT_DIR/prepareNewDeploymentRemote.sh"

# backup the old html folder, unzip the new release and update permissions etc
# we do this via a remote script as there are many steps and doing so one by one remotely times out occasionally
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST "cd $WWW_ROOT_DIR && ./prepareNewDeploymentRemote.sh $VERSION"

