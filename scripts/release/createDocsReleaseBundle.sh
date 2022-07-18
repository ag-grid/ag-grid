#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version number"
    echo "For example: ./scripts/release/createDocsReleaseBundle.sh 19.1.2"
    exit 1
fi

ZIP_PREFIX=`date +%Y%m%d`
RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""

echo "Starting Docs Bundle Process"
cd grid-packages/ag-grid-docs
npm run clean

echo "Gatsby Package"
cd documentation
npm run clean
GATSBY_HOST=www.ag-grid.com GATSBY_USE_PUBLISHED_PACKAGES=true npm run package
cd ..

echo "Building Docs Release Bundle"
npx gulp release
cd dist

echo "Creating Release Archive"
FILENAME=release_"$ZIP_PREFIX"_v"$VERSION".zip
zip -r ../../../$FILENAME .

cd ../../../

