#!/bin/bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply a release file to upload and unzip"
    echo "For example: ./scripts/uploadAndUnzipRelease.sh release_20190222_v2010.zip"
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

FILENAME=$1

echo $FILENAME

checkFileExists $FILENAME
checkFileExists ~/aggrid/aggrid.txt
checkFileExists ~/.ssh/ag_ssh
checkFileExists ~/aggrid/.creds

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

USERNAME=`awk '{print $1}' ~/aggrid/aggrid.txt`
PASSWORD=`awk '{print $2}' ~/aggrid/aggrid.txt`

# upload file - note that this will be uploaded to the archive dir as this is where this ftps home account is
# we'll move this file up one in the next step
curl --netrc-file ~/aggrid/.creds --ftp-create-dirs -T $FILENAME ftp://ftp.kpidrill.com/

# move file from the archives dir to the ag-grid root (ie live root)
ssh -i ~/.ssh/ag_ssh -p 2222 ceolter@kpidrill.com "mv public_html/ag-grid.com/archive/$FILENAME public_html/ag-grid.com/"

# unzip release
ssh -i ~/.ssh/ag_ssh -p 2222 ceolter@kpidrill.com "cd public_html/ag-grid.com/ && unzip $FILENAME"

