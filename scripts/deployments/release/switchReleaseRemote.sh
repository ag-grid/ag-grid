#!/bin/bash

##########################################################################################
## This script is meant to live on ag-grid.com and be invoked by someone doing a deployment
## It's in a separate script as occasionally multiple "ssh -i" from a devs machine would
## result in some of the commands being rejected. Extracting these multiple commands into one
## should alleviate that
##########################################################################################

if [ "$#" -lt 1 ]
  then
    echo "You must supply a timestamp"
    echo "For example: ./scripts/release/switchReleaseRemote.sh 20191210"
    exit 1
fi

TIMESTAMP=$1

PUBLIC_HTML_PATH="@PUBLIC_HTML_PATH@"
WORKING_DIR_ROOT="@WORKING_DIR_ROOT@"

# create a backup of the html folder ONLY if it doesn't already exist - this handles the situation where multiple deployments are done on the same day
# in that case we only want to backup the original html folder, not the subsequent attempts (for rollback)
if [ -d "$WORKING_DIR_ROOT/public_html_$TIMESTAMP" ];
then
  # if this block is run then it means that this is not the first deployment done today
  echo "$WORKING_DIR_ROOT/public_html_$TIMESTAMP already exists - not backing up existing html folder"

  # move archives from the previous "live" to the original html backup: public_html_$TIMESTAMP
  # this will in turn be moved to the new html folder down below
  mv $PUBLIC_HTML_PATH/archive $WORKING_DIR_ROOT/public_html_$TIMESTAMP/archive

  # it's unlikely we'd need the version we're replacing, but just in case
  CURRENT_BACKUP_DIR="public_html_`date '+%Y%m%d_%H%M'`"
  mv $PUBLIC_HTML_PATH $WORKING_DIR_ROOT/$CURRENT_BACKUP_DIR
else
  mv $PUBLIC_HTML_PATH $WORKING_DIR_ROOT/public_html_$TIMESTAMP
fi

mv $WORKING_DIR_ROOT/public_html_tmp $PUBLIC_HTML_PATH

# we don't copy the archives - it's too big
mv $WORKING_DIR_ROOT/public_html_$TIMESTAMP/archive $PUBLIC_HTML_PATH/

cp -R $WORKING_DIR_ROOT/public_html_$TIMESTAMP/eula $PUBLIC_HTML_PATH/
cp -R $WORKING_DIR_ROOT/public_html_$TIMESTAMP/ecommerce $PUBLIC_HTML_PATH/
cp -R $WORKING_DIR_ROOT/public_html_$TIMESTAMP/support $PUBLIC_HTML_PATH/
cp -R $WORKING_DIR_ROOT/public_html_$TIMESTAMP/__shared $PUBLIC_HTML_PATH/
cp -R $WORKING_DIR_ROOT/public_html_$TIMESTAMP/robots.txt $PUBLIC_HTML_PATH/
