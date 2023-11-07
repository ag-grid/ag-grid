#!/bin/bash

CHANGES=`git diff HEAD --name-only | grep -v package.json |  wc -l`
if [ $CHANGES -ne 0 ]
then
    echo "ERROR Local file modifications found for ag-grid-enterprise." >&2
    git diff-index HEAD -- . >&2
    git diff HEAD -- . >&2
    exit 1
fi

echo "No local file modifications found for ag-grid-enterprise."
