#!/bin/bash

INSTANCES=`grep -R --exclude-dir={node_modules,lib,dist,.cache,_dev,_gen} --include=\*.ts --include=\*.js --include=\*.tsx --include=\*.jsx  'debugger' . | awk '{$1=$1};1' | grep -v ./grid-enterprise-modules/sparklines/src/util/observable.ts | grep -v grid-packages/ag-grid-docs/documentation/public | wc -l`

if [ $INSTANCES -ne 0 ]
then
  echo "Found instances of 'debugger' in source code!"
  exit 1
fi

exit 0
