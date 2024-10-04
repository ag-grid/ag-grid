#!/bin/bash

if [ "$#" -ne 5 ]
  then
    echo "You must supply a source branch, new branch name, grid version, charts version and gen key location"
    echo "For example: ./scripts/deployments/release/createAndBuildNewBranchFromExistingBranch.sh latest b19.1.2 19.1.2 2.0.0"
    echo "For example: ./scripts/deployments/release/createAndBuildNewBranchFromExistingBranch.sh latest b19.1.2 19.1.2 2.0.0"
    echo "For example: ./scripts/deployments/release/createAndBuildNewBranchFromExistingBranch.sh latest b19.1.2 19.1.2 2.0.0"
    exit 1
fi

SOURCE_BRANCH=$1
NEW_BRANCH=$2

NEW_GRID_VERSION=$3
PEER_GRID_VERSION=$3

NEW_CHARTS_VERSION=$4
PEER_CHARTS_VERSION=$4

GEN_KEY_DEFAULT_LOCATION="$5"

echo "########################################################################"
echo "########### Creating and switching to new branch $NEW_BRANCH ###########"
./scripts/deployments/prep_and_archive/createAndSwitchToBranch.sh $SOURCE_BRANCH $NEW_BRANCH

echo "########################################################################"
echo "#################### Updating LicenseManager ###########################"
if [ -f "$GEN_KEY_DEFAULT_LOCATION" ]; then
    node ./scripts/deployments/prep_and_archive/updateLicenseManager.js `node "$GEN_KEY_DEFAULT_LOCATION" release`
else
    echo "ERROR: $GEN_KEY_DEFAULT_LOCATION does not exist."
    exit 1
fi

echo "########################################################################"
echo "####### Updating  package.json version.ts files                #########"
node scripts/deployments/versionModules.js $NEW_GRID_VERSION $PEER_GRID_VERSION $PEER_CHARTS_VERSION

echo "########################################################################"
echo "##################### Updating licenses ################################"
./scripts/deployments/prep_and_archive/updateLicenses.sh

echo "########################################################################"
echo "################# Installing Dependencies & Building #########################"
npm run bootstrap
