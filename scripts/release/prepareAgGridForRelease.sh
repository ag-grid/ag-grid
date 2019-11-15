#!/usr/bin/env bash

TIMESTAMP=$(date +%Y%m%d);
BACKUP_DIR=/home/ceolter/release_bak_"$TIMESTAMP"
if [ "$#" -eq 1 ]
  then
    TIMESTAMP=$1
fi

mkdir "$BACKUP_DIR"

NON_VERSIONED_ENTRIES=(support ecommerce services robots.txt .htaccess .ftpquota)
for entry in "${NON_VERSIONED_ENTRIES[@]}"; do
  cp -R "/home/ceolter/public_html/$entry" $BACKUP_DIR/
done

# ignore if file doesn't exist (it should though...)
cp "/home/ceolter/public_html/release_201*.zip" "$BACKUP_DIR/" 2> /dev/null
mv "/home/ceolter/public_html/archive" "$BACKUP_DIR"/

rm -rf /home/ceolter/public_html/*
