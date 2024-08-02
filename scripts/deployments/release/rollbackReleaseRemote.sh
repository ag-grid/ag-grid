#!/bin/bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a timestamp"
    echo "For example: ./scripts/release/rollbackReleaseRemote.sh 20191210"
    exit 1
fi

BACKUP_TIMESTAMP=$1
BACKUP_DIR="public_html_$BACKUP_TIMESTAMP"

if [ ! -d $BACKUP_DIR ];
then
  echo "$BACKUP_DIR does NOT exist! Cannot rollback to timestamp $BACKUP_TIMESTAMP"
  exit 1;
fi

# it's unlikely we'd need the version we're rolling back, but just in case
CURRENT_BACKUP_DIR="public_html_`date '+%Y%m%d_%H%M'`"
mv public_html $CURRENT_BACKUP_DIR

# now restore public_html from the backup specified
mv $BACKUP_DIR public_html
mv $BACKUP_DIR/archive public_html/
