#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createAndUploadDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

TIMESTAMP=`date +%Y%m%d`

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

echo "************************************************************************"
echo "******************** Create Release Bundle *****************************"
echo "************************************************************************"
./scripts/release/createDocsReleaseBundle.sh $RAW_VERSION
echo "************************************************************************"
echo "******************** Uploading Release Bundle **************************"
echo "************************************************************************"
./scripts/release/uploadReleaseZip.sh $FILENAME
echo "************************************************************************"
echo "******************** Archiving Current Release *************************"
echo "************************************************************************"
./scripts/release/archiveCurrentRelease.sh
echo "************************************************************************"
echo "******************** Preparing For New Deployment **********************"
echo "************************************************************************"
./scripts/release/prepareNewDeployment.sh $FILENAME
echo "************************************************************************"
echo "******************** Switch To New Release *****************************"
echo "************************************************************************"
./scripts/release/switchRelease.sh $TIMESTAMP $2
echo "************************************************************************"
echo "******************** Download Changelog Data *****************************"
echo "************************************************************************"
./scripts/release/downloadChangelog.sh
echo "************************************************************************"
echo "******************** Update Algolia Indices *****************************"
echo "************************************************************************"
./scripts/release/updateAlgoliaIndices.sh
echo "************************************************************************"
echo "*********************** Tag Docs Release *******************************"
echo "************************************************************************"
TAG="vDocs-$RAW_VERSION-$TIMESTAMP"
git tag -a $TAG -m "Docs Update: Version $VERSION, On: $TIMESTAMP"
git push origin $TAG
