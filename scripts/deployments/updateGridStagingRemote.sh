#!/usr/bin/env bash

echo "Cleaning current grid staging"
rm -rf @WWW_ROOT_DIR@/html/*
mv @FILENAME@ @WWW_ROOT_DIR@/html/

echo "Unzipping new grid staging"
# -o overwrites without prompting so the deployed .htaccess replaces any existing one
# (rm above leaves dotfiles untouched). Non-interactive deploy would otherwise skip it.
unzip -qo @WWW_ROOT_DIR@/html/@FILENAME@ -d @WWW_ROOT_DIR@/html/

