#!/usr/bin/env bash

# here as a quick ts test for use in the CI
# in time this will be removed the full battery of tests be moved to a centralised location

error_found=false

# a valid grid - no errors should be emitted
./node_modules/.bin/tsc --target "ES5" --module 'commonjs' --lib esnext,dom --allowSyntheticDefaultImports --jsx 'preserve' --noEmit --strict tests/SimpleGrid.ts &> /dev/null
if [ $? -ne 0 ]; then
    echo "valid ag-grid grid should compile"
    error_found=true
fi

if [ "$error_found" = true ]; then
    exit 1
fi

exit 0
