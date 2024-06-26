#!/bin/sh

cd "$(dirname "$0")"

rm ./*.scss
rm quartz/*.scss

cp ../../../../../../ag-grid/community-modules/styles/src/internal/base/parts/*.scss ./
cp ../../../../../../ag-grid/community-modules/styles/src/internal/themes/quartz/*.scss ./quartz/
cp ../../../../../../ag-grid/community-modules/styles/src/internal/base/_base-variables.scss ./quartz/
npx prettier --write .
