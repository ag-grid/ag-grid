#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a jira number"
    exit 1
fi

TARGET_DIRECTORY=$1

# sync --delete removes anything under the destination that isn't in the build, so only ever target this
# branch's own prefix: an empty, nested or relative value could point at the bucket root
if ! [[ "$TARGET_DIRECTORY" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || [[ "$TARGET_DIRECTORY" == *..* ]]
then
    echo "Invalid jira number supplied [$TARGET_DIRECTORY]"
    exit 1
fi

cd documentation/ag-grid-docs || exit 1

# sync rather than cp, so files removed from the build since the last deploy of this branch are removed too
aws s3 sync dist s3://testing.ag-grid.com/$TARGET_DIRECTORY --delete
