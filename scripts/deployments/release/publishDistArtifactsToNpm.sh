#!/usr/bin/env bash

TAG="${1:-latest}"

#publishModules()
#{
#  local directory=$1
#
#  for moduleDirectory in `ls $directory`;
#  do
#    local modulePath="$directory/$moduleDirectory/package"
#
#    echo "PUBLISHING TO NPM: $modulePath"
#    npm publish $modulePath --tag $TAG --provenance
#
#    if [ $? -ne 0 ]; then
#        echo "Error publishing $modulePath"
#        exit 1;
#    else
#        echo "$modulePath published to npm"
#    fi
#  done
#}
#
#publishModules "dist/artifacts/contents/community-modules"
#publishModules "dist/artifacts/contents/packages"

cd dist/artifacts/contents/packages/ag-stack/package
echo "PUBLISHING TO NPM: ag-stack"
npm publish --tag $TAG --provenance
