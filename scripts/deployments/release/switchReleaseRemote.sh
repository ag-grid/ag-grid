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
    echo "For example: ./scripts/deployments/release/switchReleaseRemote.sh 20191210"
    exit 1
fi

TIMESTAMP=$1

CHARTS_ROOT_DIR="@CHARTS_ROOT_DIR@"
STUDIO_ROOT_DIR="@STUDIO_ROOT_DIR@"
GRID_ROOT_DIR="@GRID_ROOT_DIR@"
WWW_ROOT_DIR="@WWW_ROOT_DIR@"

# Hold the root .htaccess lock that patchUncachedArchives.sh (and ag-charts' charts-only copy) take
# for their check-and-rename, so an in-flight patch can never land between their check and their
# rename while this replaces the docroot. A patch waiting on it sees the docroot was replaced and
# stops with a re-run message. Released when this script exits.
exec 9>>"$GRID_ROOT_DIR/.htaccess.lock"
if ! flock -w 300 9
then
    echo "Could not take $GRID_ROOT_DIR/.htaccess.lock - an in-flight patch is holding it. Re-run this."
    exit 1
fi

# create a backup of the html folder ONLY if it doesn't already exist - this handles the situation where multiple deployments are done on the same day
# in that case we only want to backup the original html folder, not the subsequent attempts (for rollback)
if [ -d "$WWW_ROOT_DIR/public_html_$TIMESTAMP" ];
then
  # if this block is run then it means that this is not the first deployment done today
  echo "$WWW_ROOT_DIR/public_html_$TIMESTAMP already exists - not backing up existing html folder"

  # move archives from the previous "live" to the original html backup: public_html_$TIMESTAMP
  # this will in turn be moved to the new html folder down below
  mv $GRID_ROOT_DIR/archive $WWW_ROOT_DIR/public_html_$TIMESTAMP/archive

  # we don't copy the charts & associated archives - it's too big
  mv $CHARTS_ROOT_DIR $WWW_ROOT_DIR/public_html_$TIMESTAMP/charts
  mv $STUDIO_ROOT_DIR $WWW_ROOT_DIR/public_html_$TIMESTAMP/studio

  # it's unlikely we'd need the version we're replacing, but just in case
  CURRENT_BACKUP_DIR="public_html_`date '+%Y%m%d_%H%M'`"
  mv $GRID_ROOT_DIR $WWW_ROOT_DIR/$CURRENT_BACKUP_DIR
else
  mv $GRID_ROOT_DIR $WWW_ROOT_DIR/public_html_$TIMESTAMP
fi

mv $WWW_ROOT_DIR/public_html_tmp $GRID_ROOT_DIR

# we don't copy the archives - it's too big
mv $WWW_ROOT_DIR/public_html_$TIMESTAMP/archive $GRID_ROOT_DIR/

# we don't copy the charts/studio & associated archives - they're too big
mv $WWW_ROOT_DIR/public_html_$TIMESTAMP/charts $CHARTS_ROOT_DIR
mv $WWW_ROOT_DIR/public_html_$TIMESTAMP/studio $STUDIO_ROOT_DIR

cp -R $WWW_ROOT_DIR/public_html_$TIMESTAMP/ecommerce $GRID_ROOT_DIR/
cp -R $WWW_ROOT_DIR/public_html_$TIMESTAMP/support $GRID_ROOT_DIR/
cp -R $WWW_ROOT_DIR/public_html_$TIMESTAMP/__shared $GRID_ROOT_DIR/
cp -R $WWW_ROOT_DIR/public_html_$TIMESTAMP/blog $GRID_ROOT_DIR/
