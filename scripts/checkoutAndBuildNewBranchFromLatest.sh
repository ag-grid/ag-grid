#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply a new branch name, release version and dependency version"
    echo "For example: ./scripts/checkoutAndBuildNewBranchFromLatest.sh b19.1.2 19.1.2 ^19.1.0"
    exit 1
fi

NEW_BRANCH=$1
NEW_VERSION=$2
PEER_VERSION=$3

GEN_KEY_DEFAULT_LOCATION=~/aggrid/genKey/genKey.js

echo "########################################################################"
echo "###################### Switching to latest #############################"
./scripts/switchToBranch.sh latest

echo "########################################################################"
echo "########### Creating and switching to new branch $NEW_BRANCH ###########"
./scripts/createAndSwitchToBranch.sh b19.1.2

echo "########################################################################"
echo "#################### Updating LicenseManager ###########################"
if [ -f $GEN_KEY_DEFAULT_LOCATION ]; then
    node scripts/updateLicenseManager.js `node $GEN_KEY_DEFAULT_LOCATION release`
else
    echo "$GEN_KEY_DEFAULT_LOCATION does not exist. Please update the License Key manually"
fi

echo "########################################################################"
echo "####### Updating lerna.json, package.json and bower.json files #########"
node scripts/versionModules.js $NEW_VERSION $PEER_VERSION

echo "########################################################################"
echo "################# Installing Root Dependencies #########################"
npm install

echo "########################################################################"
echo "################# Installing Package Dependencies #########################"
./node_modules/.bin/lerna bootstrap

echo "########################################################################"
echo "###################### Installing Packages #############################"
./node_modules/.bin/lerna run build

echo "########################################################################"
echo "##################### Updating .gitignore #############################"
node scripts/updateGitIgnore.js $NEW_VERSION $PEER_VERSION

