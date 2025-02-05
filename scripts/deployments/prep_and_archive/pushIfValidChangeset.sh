#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply a release version and release branch"
    exit 1
fi

RELEASE_VERSION=$1
RELEASE_BRANCH=$2
ALLOWED_FILES="package.json|yarn.lock|version.ts|licenseManager.ts|.env|README.md|baseUrl.ts|documentation/ag-grid-docs/src/content/versions/ag-grid-versions.json"

NON_PACKAGE_JSON_COUNT=`git status --porcelain | grep -Ev "$ALLOWED_FILES" | wc -l`

if [ $NON_PACKAGE_JSON_COUNT -ne 0 ];
then
  echo "Only the following files should be updated: $ALLOWED_FILES. Please verify the changeset."
  git status --porcelain
  exit 1
fi

git add .
git commit -am "Release $RELEASE_VERSION Prep"
git push -u origin "$RELEASE_BRANCH"
