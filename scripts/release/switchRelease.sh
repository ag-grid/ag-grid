#!/bin/bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a timestamp"
    echo "For example: ./scripts/release/prepareAgGridForRelease.sh 20191210"
    exit 1
fi

SSH_LOCATION=$HOME/$SSH_FILE

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit;
fi

checkFileExists $SSH_LOCATION

TIMESTAMP=$1

# $2 is optional skipWarning argument
if [ "$2" != "skipWarning" ]; then
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

# move file from the archives dir to the root
ssh -i $SSH_LOCATION ceolter@ag-grid.com "mv public_html public_html_$TIMESTAMP"
ssh -i $SSH_LOCATION ceolter@ag-grid.com "mv public_html_tmp public_html"

# we don't copy the archives - it's too big
ssh -i $SSH_LOCATION ceolter@ag-grid.com "mv public_html_$TIMESTAMP/archive public_html/"

