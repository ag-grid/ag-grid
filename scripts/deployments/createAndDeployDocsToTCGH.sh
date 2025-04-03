#!/usr/bin/env bash

# once tested this script will replace createAndDeployDocsToTC.sh

ZIP_PREFIX=`date +%Y%m%d`

echo "Deploying Docs to Build Server"

if [ ! -d "documentation/ag-grid-docs/dist" ];
then
  echo "documentation/ag-grid-docs/dist does NOT EXIST. Exiting with error."
  exit 1
fi

cd documentation/ag-grid-docs/dist

FILENAME=release_"$ZIP_PREFIX"_v"$ZIP_PREFIX".zip
echo "Creating $FILENAME"
zip -qr ../../../$FILENAME *

cd ../../../

echo "Uploading $FILENAME"
scp -i $SSH_KEY_LOCATION -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $FILENAME $SSH_USER@$SSH_HOST:$WWW_ROOT_DIR/

sed "s#\@WWW_ROOT_DIR\@#$WWW_ROOT_DIR#g" ./scripts/deployments/updateGridStagingRemote.sh |  sed "s#\@FILENAME\@#$FILENAME#g" > /tmp/updateGridStagingRemote.sh

scp -i $SSH_KEY_LOCATION -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/updateGridStagingRemote.sh $SSH_USER@$SSH_HOST:$WWW_ROOT_DIR/

echo "Updating Grid Staging with $FILENAME"
ssh -i $SSH_KEY_LOCATION -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "cd $WWW_ROOT_DIR && chmod +x updateGridStagingRemote.sh && ./updateGridStagingRemote.sh"
