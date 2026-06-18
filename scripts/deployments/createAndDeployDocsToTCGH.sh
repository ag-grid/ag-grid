#!/usr/bin/env bash

# once tested this script will replace createAndDeployDocsToTC.sh

set -euo pipefail

: "${SSH_KEY_LOCATION:?SSH_KEY_LOCATION is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${SSH_HOST:?SSH_HOST is required}"
: "${WWW_ROOT_DIR:?WWW_ROOT_DIR is required}"

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
# The glob above skips dotfiles, so add the generated .htaccess explicitly (present on staging/production builds)
if [ -f .htaccess ]; then
  zip -q ../../../$FILENAME .htaccess
fi

cd ../../../

echo "Uploading $FILENAME"
scp -i $SSH_KEY_LOCATION -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $FILENAME $SSH_USER@$SSH_HOST:$WWW_ROOT_DIR/

sed "s#\@WWW_ROOT_DIR\@#$WWW_ROOT_DIR#g" ./scripts/deployments/updateGridStagingRemote.sh |  sed "s#\@FILENAME\@#$FILENAME#g" > /tmp/updateGridStagingRemote.sh

scp -i $SSH_KEY_LOCATION -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/updateGridStagingRemote.sh $SSH_USER@$SSH_HOST:$WWW_ROOT_DIR/

echo "Updating Grid Staging with $FILENAME"
ssh -i $SSH_KEY_LOCATION -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "cd $WWW_ROOT_DIR && chmod +x updateGridStagingRemote.sh && ./updateGridStagingRemote.sh"
