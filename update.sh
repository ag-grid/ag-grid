#!/bin/sh

cd "$(dirname "$0")/grid-packages/ag-grid-theme-builder/src/ag-grid-community-themes/scss-commented-out-as-ported"

rm ./*.scss
rm quartz/*.scss

cp ../../../../../../ag-grid/community-modules/styles/src/internal/base/parts/*.scss ./
cp ../../../../../../ag-grid/community-modules/styles/src/internal/themes/quartz/*.scss ./quartz/
cp ../../../../../../ag-grid/community-modules/styles/src/internal/base/_base-variables.scss ./quartz/
npx prettier --write .
