#!/usr/bin/env bash

TIMESTAMP=$(date +%Y%m%d);
BACKUP_DIR=/home/ceolter/release_bak_"$TIMESTAMP"
if [ "$#" -eq 1 ]
  then
    TIMESTAMP=$1
fi

NON_VERSIONED_ENTRIES=$BACKUP_DIR/*
for entry in $NON_VERSIONED_ENTRIES
do
  if [ "$entry" != "$BACKUP_DIR/archive" ]
  then
    cp -R "$entry" /home/ceolter/public_html/
  fi
done

mv "$BACKUP_DIR/archive" /home/ceolter/public_html/
