#!/usr/bin/env bash

array=("production" "staging")

if [[ ${array[@]} =~ "$NX_TASK_TARGET_CONFIGURATION" ]]
then
  echo "Building PRODUCTION UMDs for $NX_TASK_TARGET_PROJECT"
  npx webpack --env production --env minify --env styles       --env entry=./src/main-styles.ts &
  npx webpack --env production              --env styles       --env entry=./src/main-styles.ts &
  npx webpack --env production --env minify --env styles=false --env entry=./src/main.ts &
  npx webpack --env production              --env styles=false --env entry=./src/main.ts &
  wait
else
  echo "Building DEVELOPMENT UMDs for $NX_TASK_TARGET_PROJECT"
  npx webpack
fi

