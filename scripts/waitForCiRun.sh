#!/bin/bash

set -eux

BRANCH=$1

count=0
RUN_ID=
while [[ -z "$RUN_ID" && count -lt 6 ]];
do
  RUN_ID=`gh run list | grep $BRANCH | grep "CI" | cut -f 7`
  count=$((count+1))
  sleep 5
done

if [[ -z "$RUN_ID" ]];
then
  echo "CI run not initiated in time"
  exit 1
fi
