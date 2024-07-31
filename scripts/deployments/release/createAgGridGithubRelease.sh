#!/bin/bash

if [ "$#" -ne 2 ]
  then
    echo "You must supply github username and release version"
    echo "For example: ./scripts/release/createAgGridGithubRelease.sh seanlandsman 20.0.0"
    exit 1
fi

USERNAME=$1
VERSION=$2

./scripts/release/createGithubRelease.sh ag-grid/ag-grid $USERNAME $VERSION
