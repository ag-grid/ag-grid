#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a dist directory"
    exit 1
fi

TAG=${2:-latest}

DIST_DIRECTORY="$1/dist/artifacts"

if [ ! -d $DIST_DIRECTORY/community-modules ] | [ ! -d $DIST_DIRECTORY/packages ]
  then
    echo "You must supply a valid dist directory"
    exit 1
fi

RELEASE_VERSION=`node -e "console.log(require(\"$1/package.json\").version)"`

cd $DIST_DIRECTORY/community-modules
PACKAGE_NAME="ag-grid-locale"
echo $PACKAGE_NAME
npm publish "locale.tgz" --registry https://registry.ag-grid.com/
npm dist-tag add $PACKAGE_NAME@$RELEASE_VERSION latest --registry=https://registry.ag-grid.com/

PACKAGE_NAME="@ag-grid-community/styles"
echo $PACKAGE_NAME
npm publish "styles.tgz" --registry https://registry.ag-grid.com//
npm dist-tag add $PACKAGE_NAME@$RELEASE_VERSION latest --registry=https://registry.ag-grid.com/

cd ../packages
for file in *.tgz; do
    PACKAGE_NAME=`basename $file .tgz`
    echo $PACKAGE_NAME

    npm publish "$file" --registry https://registry.ag-grid.com// --tag $TAG
    npm dist-tag add $PACKAGE_NAME@$RELEASE_VERSION $TAG --registry=https://registry.ag-grid.com/
done

