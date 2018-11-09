#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the release version"
    echo "For example copy-community-dist-to-root.sh 19.1.2"
    exit 1
fi

cp -r packages/ag-grid-community/dist .
cp packages/ag-grid-community/main.d.ts .
cp packages/ag-grid-community/main.js .
cp packages/ag-grid-community/bower.json .

node ./scripts/versionPackageJson.js $1