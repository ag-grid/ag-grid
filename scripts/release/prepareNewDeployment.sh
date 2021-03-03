#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release filename "
    echo "For example: ./scripts/release/deployAgGridRelease.sh release_20191210.zip"
    exit 1
fi

SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit;
fi

checkFileExists $SSH_LOCATION

FILENAME=$1

# backup the old public_html, unzip the new release and update permissions etc
ssh -i $SSH_LOCATION ceolter@ag-grid.com "cd /home/ceolter/ && ./prepareNewDeploymentRemote.sh $FILENAME"
