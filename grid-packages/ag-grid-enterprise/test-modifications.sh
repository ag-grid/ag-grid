#!/bin/sh

set -eu

if (! git diff HEAD --quiet -- .) ; then
    echo "Local file modifications found for ag-grid-enterprise." # >&2
    git diff-index HEAD -- . # >&2
    git diff HEAD -- . # >&2
    exit 0 # TODO: Re-enable failure for this case in the future.
fi

echo "No local file modifications found for ag-grid-enterprise."
