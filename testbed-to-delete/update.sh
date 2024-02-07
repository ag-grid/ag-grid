#!/usr/bin/env bash

CWD=`pwd`;

rm *.tgz

function packModule() {
  local PARENT_DIRECTORY=$1
  local MODULE=$2

  cd "$PARENT_DIRECTORY/$MODULE"
  npm pack --pack-destination $CWD
  cd -
}

function packModules() {
  local PARENT_DIRECTORY=$1
  shift
  local MODULES=("$@")

  for MODULE in "${MODULES[@]}";
  do
     packModule $PARENT_DIRECTORY $MODULE;
  done
}

COMMUNITY_MODULES=("core" "client-side-row-model" "styles")
packModules "../community-modules" "${COMMUNITY_MODULES[@]}"

ENTERPRISE_MODULES=("core" "status-bar")
packModules "../enterprise-modules" "${ENTERPRISE_MODULES[@]}"

if [ -d "./node_modules" ]; then
  cd "./node_modules"
  rm -rf ag-charts-community ag-charts-enterprise ag-charts-angular ag-charts-react ag-charts-vue ag-charts-vue3 @ag-grid-community @ag-grid-enterprise ag-grid-community ag-grid-enterprise
fi

npm i --no-package-lock
