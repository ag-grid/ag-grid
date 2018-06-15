#!/usr/bin/env bash

# to be run in the root directory, and this only really makes sense when NOT ON MASTER!
CURRENT_BRANCH=`git branch | grep \* | cut -d ' ' -f2-`

if [ "$CURRENT_BRANCH" = "master" ]
then
    echo "This script is not to be run on master!"
    exit 1
fi

git rm -r packages/ag-grid/dist/lib/
git rm --cached -r packages/ag-grid/dist/lib/
git rm -r packages/ag-grid-angular/aot/
git rm --cached -r packages/ag-grid-angular/aot/
git rm -r packages/ag-grid-angular/dist/
git rm --cached -r packages/ag-grid-angular/dist/
git rm -r packages/ag-grid-angular/main.js.map
git rm --cached -r packages/ag-grid-angular/main.js.map
git rm -r packages/ag-grid-aurelia/lib/
git rm --cached -r packages/ag-grid-aurelia/lib/
git rm -r packages/ag-grid-aurelia-example/scripts/
git rm --cached -r packages/ag-grid-aurelia-example/scripts/
git rm -r packages/ag-grid-enterprise/dist/
git rm --cached -r packages/ag-grid-enterprise/dist/

git rm --cached packages/ag-grid/dist/ag-grid.js
git rm --cached packages/ag-grid/dist/ag-grid.min.js
git rm --cached packages/ag-grid/dist/ag-grid.min.noStyle.js
git rm --cached packages/ag-grid/dist/ag-grid.noStyle.js
git rm packages/ag-grid/dist/ag-grid.js
git rm packages/ag-grid/dist/ag-grid.min.js
git rm packages/ag-grid/dist/ag-grid.min.noStyle.js
git rm packages/ag-grid/dist/ag-grid.noStyle.js

