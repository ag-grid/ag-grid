#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a jira number"
    exit 1
fi

TARGET_DIRECTORY=$1

# sync --delete removes anything under the destination that isn't in dist, so make sure the destination is
# a branch's own prefix and never the bucket root (an empty or "/" argument would otherwise wipe every branch)
TARGET_CHECK=`echo "$TARGET_DIRECTORY" | sed 's|/||g' | tr -d ' '`
if [[ "$TARGET_CHECK" == "" || "$TARGET_CHECK" == "." || "$TARGET_CHECK" == ".." ]]
then
  echo "Invalid jira number supplied [$TARGET_DIRECTORY]"
  exit 1
fi

cd documentation/ag-grid-docs || exit 1

# sync rather than cp, so files removed from the build since the last deploy of this branch are removed too
aws s3 sync dist s3://testing.ag-grid.com/$TARGET_DIRECTORY --delete
