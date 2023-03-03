#!/bin/sh

set -eu

if (! git diff-index --quiet HEAD --) ; then 
    echo "Local file modifications found." >&2
    exit 1
fi

echo "No local file modifications found."
