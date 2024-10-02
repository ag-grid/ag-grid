#!/bin/bash

for directory in 'community-modules' 'packages';
do
  for moduleDirectory in `ls $directory`;
  do
    if [ -d "$directory/$moduleDirectory/node_modules" ]; then
      cd "$directory/$moduleDirectory/node_modules"
      rm -rf ag-charts-community ag-charts-enterprise ag-charts-angular ag-charts-react ag-charts-vue ag-charts-vue3
      cd -
    fi
  done
done

if [ -d "packages/ag-grid-docs/node_modules" ]; then
  cd "packages/ag-grid-docs/node_modules"
  rm -rf ag-charts-community ag-charts-enterprise ag-charts-angular ag-charts-react ag-charts-vue ag-charts-vue3
fi
