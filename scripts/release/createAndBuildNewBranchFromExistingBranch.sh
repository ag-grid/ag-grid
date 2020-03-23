#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply a source branch, new branch name, release version and dependency version"
    echo "For example: ./scripts/release/checkoutAndBuildNewBranchFromLatest.sh latest b19.1.2 19.1.2 ~19.1.0 2.0.0 ~2.0.0"
    exit 1
fi

SOURCE_BRANCH=$1
NEW_BRANCH=$2

NEW_GRID_VERSION=$3
PEER_GRID_VERSION=$4

NEW_CHARTS_VERSION=$5
PEER_CHARTS_VERSION=$6

GEN_KEY_DEFAULT_LOCATION=~/Documents/aggrid/aggrid/genkey/genKey.js

echo "########################################################################"
echo "########### Creating and switching to new branch $NEW_BRANCH ###########"
./scripts/release/createAndSwitchToBranch.sh $SOURCE_BRANCH $NEW_BRANCH

echo "########################################################################"
echo "#################### Updating LicenseManager ###########################"
if [ -f $GEN_KEY_DEFAULT_LOCATION ]; then
    node scripts/release/updateLicenseManager.js `node $GEN_KEY_DEFAULT_LOCATION release`
else
    echo "$GEN_KEY_DEFAULT_LOCATION does not exist. Please update the License Key manually"
fi

echo "########################################################################"
echo "####### Updating lerna.json, package.json and bower.json files #########"
node scripts/release/versionModules.js $NEW_CHARTS_VERSION $PEER_CHARTS_VERSION '["charts-packages", "examples-charts"]'
node scripts/release/versionModules.js $NEW_GRID_VERSION $PEER_GRID_VERSION '["grid-packages", "community-modules", "enterprise-modules", "examples-grid"]' $PEER_CHARTS_VERSION

echo "########################################################################"
echo "################# Installing Dependencies & Building #########################"
npm run updateAndRebuild

echo "########################################################################"
echo "###################### Packaging #############################"
./node_modules/.bin/lerna run package

echo "########################################################################"
echo "##################### Updating .gitignore #############################"
node scripts/release/updateGitIgnore.js

echo "########################################################################"
echo "##################### Updating licenses #############################"
./scripts/release/updateLicenses.sh

