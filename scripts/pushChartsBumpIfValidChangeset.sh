#!/usr/bin/env bash

NON_PACKAGE_JSON_COUNT=`git status --porcelain | grep -v package.json | wc -l`

if [ $NON_PACKAGE_JSON_COUNT -ne 0 ];
then
  echo "Only package.json files should be updated - please verify changeset locally and push."
  git status --porcelain
  exit 1
fi

git add .
git commit -am "Bump charts dependency versions"
git push
