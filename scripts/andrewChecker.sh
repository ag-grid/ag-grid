#!/bin/bash

INSTANCES=`grep -R --exclude-dir={node_modules,lib,dist,.cache,_dev,_gen,lib} --include=\*.ts --include=\*.js --include=\*.tsx --include=\*.jsx  'debugger\b' . | awk '{$1=$1};1' |  wc -l`

if [ $INSTANCES -ne 0 ]
then
  echo "Found instances of 'debugger' in source code!"
  exit 1
fi

exit 0
