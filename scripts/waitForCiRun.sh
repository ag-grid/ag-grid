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

# Wait for workflow to complete
echo $RUN_ID
gh run watch $RUN_ID --exit-status

# Wait for the branch to be merged into latest
merged_count=0
merged_sleep=60
merged_wait_count=$((600 / merged_sleep)) # Wait for up to 10mins
while [[ merged_count -lt merged_wait_count ]]; do
  MERGED=$(gh pr view $BRANCH --json mergedAt --jq '.mergedAt')
  STATE=$(gh pr view $BRANCH --json state --jq '.state')

  if [ -n "$MERGED" ] && [ "$MERGED" != "null" ]; then
    echo "PR #$BRANCH merged!"
    break
  elif [ "$STATE" = "CLOSED" ]; then
    echo "PR #$BRANCH was closed without merging!"
    exit 1
  fi

  merged_count=$((merged_count+1))
  sleep $merged_sleep
done

if [[ merged_count -ge merged_wait_count ]]; then
  echo "PR #$BRANCH was not merged within the timeout period"
  exit 1
fi
