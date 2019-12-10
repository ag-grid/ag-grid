#!/bin/bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply a timestamp"
    echo "For example: ./scripts/release/prepareAgGridForRelease.sh 20191210"
    exit 1
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

checkFileExists ~/.ssh/ag_ssh

TIMESTAMP=$1

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

# move file from the archives dir to the root
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mv public_html public_html_$TIMESTAMP"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mv public_html_tmp public_html"

# we don't copy the archives - it's too big
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mv public_html_$TIMESTAMP/archive public_html/"

