#!/bin/bash

SOURCE_DIR="core"

COMMUNITY_ROOT=./community-modules
SOURCE_COMMUNITY_LICENSE=$COMMUNITY_ROOT/core/LICENSE.txt
LEGACY_ROOT=./grid-packages
LEGACY_COMMUNITY_DIRS=("ag-grid-angular" "ag-grid-community" "ag-grid-polymer" "ag-grid-react" "ag-grid-vue")
LEGACY_ENTERPRISE_DIRS=(ag-grid-enterprise)

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
      cp "$source_license" "$directory_root/$directory/"
    fi
  done
}

copyLicenses $COMMUNITY_ROOT $SOURCE_COMMUNITY_LICENSE $(ls $COMMUNITY_ROOT)
copyLicenses $LEGACY_ROOT $SOURCE_COMMUNITY_LICENSE "${LEGACY_COMMUNITY_DIRS[@]}"

copyLicenses $ENTERPRISE_ROOT $SOURCE_ENTERPRISE_LICENSE  $(ls $ENTERPRISE_ROOT)
copyLicenses $LEGACY_ROOT $SOURCE_ENTERPRISE_LICENSE "${LEGACY_ENTERPRISE_DIRS[@]}"
