#!/bin/bash

if [ "$#" -ne 6 ]
  then
    echo "You must supply a source branch, new branch name, grid version, charts version projects and modules to update"
    echo "For example: ./scripts/release/createAndBuildNewBranchFromExistingBranch.sh latest b19.1.2 19.1.2 2.0.0 all all"
    echo "For example: ./scripts/release/createAndBuildNewBranchFromExistingBranch.sh latest b19.1.2 19.1.2 2.0.0 charts react"
    echo "For example: ./scripts/release/createAndBuildNewBranchFromExistingBranch.sh latest b19.1.2 19.1.2 2.0.0 grid react,vue"
    exit 1
fi

SOURCE_BRANCH=$1
NEW_BRANCH=$2

NEW_GRID_VERSION=$3
PEER_GRID_VERSION="~$3"

NEW_CHARTS_VERSION=$4
PEER_CHARTS_VERSION="~$4"

PROJECTS_TO_VERSION=$5
MODULES_TO_VERSION=$6

if [ $PROJECTS_TO_VERSION != "all" ] && [ $PROJECTS_TO_VERSION != "grid" ] && [ $PROJECTS_TO_VERSION != "charts" ]; then
  echo "Projects to version must be one of [all,grid,charts]"
  exit 1;
fi

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
echo "####### Updating lerna.json, package.json, bower.json and version.ts files #########"
if [ $PROJECTS_TO_VERSION == "all" ] || [ $PROJECTS_TO_VERSION == "charts" ]; then
  echo "Versioning Charts Packages"
  node scripts/release/versionModules.js $NEW_CHARTS_VERSION $PEER_CHARTS_VERSION '["charts-community-modules", "charts-enterprise-modules", "charts-examples"]' $MODULES_TO_VERSION
fi
if [ $PROJECTS_TO_VERSION == "all" ] || [ $PROJECTS_TO_VERSION == "grid" ]; then
  echo "Versioning Grid Packages"
  node scripts/release/versionModules.js $NEW_GRID_VERSION $PEER_GRID_VERSION '["grid-packages", "grid-community-modules", "grid-enterprise-modules", "grid-examples"]' $MODULES_TO_VERSION $PEER_CHARTS_VERSION
fi

echo "########################################################################"
echo "################# Installing Dependencies & Building #########################"
npm run updateAndRebuildProd

echo "########################################################################"
echo "###################### Packaging #############################"
./node_modules/.bin/lerna run package

echo "########################################################################"
echo "##################### Updating .gitignore #############################"
node scripts/release/updateGitIgnore.js

echo "########################################################################"
echo "##################### Updating licenses #############################"
./scripts/release/updateLicenses.sh
