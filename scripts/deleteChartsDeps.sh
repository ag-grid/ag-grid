#!/bin/bash

for directory in 'grid-community-modules' 'grid-enterprise-modules' 'grid-examples' 'grid-packages';
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
