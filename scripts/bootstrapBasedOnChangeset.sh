#!/bin/bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the TeamCity Changeset File Location (i.e. %system.teamcity.build.changedFiles.file%)"
    exit 1
fi

CHANGESET_FILE=$1

echo "CHANGESET_FILE: $CHANGESET_FILE"

PACKAGE_JSON_COUNT=`grep "package.json" $CHANGESET_FILE | wc -l`
if [ "$PACKAGE_JSON_COUNT" -ne 0 ] || [ ! -d "$PWD/grid-community-modules/core/node_modules" ]
then
  echo "Changeset includes one or more package.json files or node_modules doesn't exist (ie a clean build) - running bootstrap"
  npm run bootstrap
else
  echo "Changeset doesn't include any package.json files - skipping bootstrap"
fi