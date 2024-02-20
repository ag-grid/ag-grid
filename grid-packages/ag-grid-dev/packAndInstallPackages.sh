#!/usr/bin/env bash

cd ../ag-grid-community
npm pack --silent
COMMUNITY_FILE=`ls -t ag-grid-community*.tgz | head -1`

cd ../ag-grid-enterprise
npm pack --silent
ENTERPRISE_FILE=`ls -t ag-grid-enterprise*.tgz | head -1`

cd ../ag-grid-dev

npm i ../ag-grid-community/$COMMUNITY_FILE
npm i ../ag-grid-enterprise/$ENTERPRISE_FILE

rm ../ag-grid-community/$COMMUNITY_FILE
rm ../ag-grid-enterprise/$ENTERPRISE_FILE

git checkout package.json
