#!/bin/bash

TIMESTAMP=`date +%Y%m%d`

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

# $1 is optional skipWarning argument
if [ "$1" != "skipWarning" ]; then
    while true; do
      echo    ""
      echo    "*********************************** ******* ************************************************"
      echo    "*********************************** WARNING ************************************************"
      echo    "*********************************** ******* ************************************************"
      read -p "This script will REPLACE the LIVE VERSION of AG-GRID!. Do you wish to continue [y/n]? " yn
      case $yn in
          [Yy]* ) break;;
          [Nn]* ) exit;;
          * ) echo "Please answer [y]es or [n]o.";;
      esac
    done
fi

# replace tokens in switchReleaseRemote.sh with env variables - we'll transfer the newly tokenised file to prod
sed "s#\@GRID_ROOT_DIR\@#$GRID_ROOT_DIR#g" ./scripts/deployments/release/switchReleaseRemote.sh | sed "s#\@WWW_ROOT_DIR\@#$WWW_ROOT_DIR#g" > /tmp/switchReleaseRemote.sh
sed "s#\@CHARTS_ROOT_DIR\@#$CHARTS_ROOT_DIR#g" /tmp/switchReleaseRemote.sh | sed "s#\@WWW_ROOT_DIR\@#$WWW_ROOT_DIR#g" > /tmp/switchReleaseRemote.sh

# copy the remote script that will create tmp dirs, unzip the new deployment etc to the upload dir (archives)
scp -i $SSH_LOCATION -P $SSH_PORT "/tmp/switchReleaseRemote.sh" $HOST:$WWW_ROOT_DIR
ssh -i $SSH_LOCATION -p $SSH_PORT $HOST "chmod +x $WWW_ROOT_DIR/switchReleaseRemote.sh"

# backup the old public html, unzip the new release and update permissions etc
# we do this via a remote script as there are many steps and doing so one by one remotely times out occasionally
#ssh -i $SSH_LOCATION -p $SSH_PORT $HOST "cd $WWW_ROOT_DIR && ./switchReleaseRemote.sh $TIMESTAMP"
