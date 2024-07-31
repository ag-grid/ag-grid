#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the release version"
    echo "For example copy-community-dist-to-root.sh 19.1.2"
    exit 1
fi

cp -r grid-packages/ag-grid-community/dist .
cp grid-packages/ag-grid-community/main.d.ts .
cp grid-packages/ag-grid-community/main.js .
cp grid-packages/ag-grid-community/bower.json .

node ./scripts/release/versionPackageJson.js $1
