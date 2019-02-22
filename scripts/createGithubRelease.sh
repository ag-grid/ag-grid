#!/bin/bash

if [ "$#" -ne 3 ]
  then
    echo "You must supply a Github repo to release (owner/repo), github username and release version"
    echo "For example: ./scripts/createGithubRelease.sh ag-grid/ag-grid seanlandsman 20.0.0"
    exit 1
fi

OWNER_REPO=$1
USERNAME=$2
VERSION=$3

while true; do
    echo    ""
    echo    "******************************** ******* ********************************"
    echo    "******************************** WARNING ********************************"
    echo    "******************************** ******* ********************************"
    read -p "This script will CREATE a github release on $OWNER_REPO!. Do you wish to continue [y/n]? " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer [y]es or [n]o.";;
    esac
done

curl --user $USERNAME --data '{"tag_name": "v'$VERSION'","target_commitish": "master",  "name": "v'$VERSION'",  "body": "Please refer to the ag-Grid [Changelog](https://www.ag-grid.com/ag-grid-changelog/?fixVersion='$VERSION') for details.",  "draft": false,  "prerelease": false}' https://api.github.com/repos/$OWNER_REPO/releases
