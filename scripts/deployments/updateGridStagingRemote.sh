#!/usr/bin/env bash

# Hold the root .htaccess lock that patchUncachedArchives.sh takes for its check-and-rename, so an
# in-flight patch cannot land between its check and its rename and undo this deploy's .htaccess.
exec 9>>@WWW_ROOT_DIR@/html/.htaccess.lock
if ! flock -w 300 9
then
    echo "Could not take @WWW_ROOT_DIR@/html/.htaccess.lock - an in-flight patch is holding it. Re-run this."
    exit 1
fi

echo "Cleaning current grid staging"
rm -rf @WWW_ROOT_DIR@/html/*
mv @FILENAME@ @WWW_ROOT_DIR@/html/

echo "Unzipping new grid staging"
# -o overwrites without prompting so the deployed .htaccess replaces any existing one
# (rm above leaves dotfiles untouched). Non-interactive deploy would otherwise skip it.
unzip -qo @WWW_ROOT_DIR@/html/@FILENAME@ -d @WWW_ROOT_DIR@/html/

