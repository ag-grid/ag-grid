#!/bin/bash

SOURCE_DIR="core"

COMMUNITY_ROOTS=("community-modules")
ENTERPRISE_ROOTS=("enterprise-modules")

SOURCE_COMMUNITY_LICENSE=./community-modules/core/LICENSE.txt

LEGACY_COMMUNITY_DIRS=("ag-grid-angular" "ag-grid-community" "ag-grid-react" "ag-grid-vue3")

ENTERPRISE_ROOT=./enterprise-modules
SOURCE_ENTERPRISE_LICENSE=$ENTERPRISE_ROOT/core/LICENSE.html

function copyLicenses {
  local directory_root="$1"
  shift
  local source_license="$1"
  shift
  local directories=("$@")

  for directory in "${directories[@]}";
  do
    if [ "$directory" != $SOURCE_DIR ]; then
      cp "$source_license" "./$directory_root/$directory/"
    fi
  done
}

function forEachDirectory {
  local source_license="$1"
  shift
  local directories=("$@")

  for directory in "${directories[@]}";
  do
    copyLicenses "$directory" "$source_license" $(ls "$directory")
  done
}

forEachDirectory $SOURCE_COMMUNITY_LICENSE "${COMMUNITY_ROOTS[@]}"
forEachDirectory $SOURCE_ENTERPRISE_LICENSE "${ENTERPRISE_ROOTS[@]}"

copyLicenses "packages" $SOURCE_COMMUNITY_LICENSE "${LEGACY_COMMUNITY_DIRS[@]}"

cp $SOURCE_ENTERPRISE_LICENSE "./packages/ag-grid-enterprise"
