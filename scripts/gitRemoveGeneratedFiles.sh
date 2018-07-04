#!/usr/bin/env bash

# to be run in the root directory, and this only really makes sense when NOT ON MASTER!
CURRENT_BRANCH=`git branch | grep \* | cut -d ' ' -f2-`

if [ "$CURRENT_BRANCH" = "master" ]
then
    echo "This script is not to be run on master!"
    exit 1
fi

git rm --cached -r packages/ag-grid/dist/lib/
git rm --cached -r packages/ag-grid-angular/aot/
git rm --cached -r packages/ag-grid-angular/dist/
git rm --cached packages/ag-grid-angular/main.js.map
git rm --cached -r packages/ag-grid-aurelia/lib/
git rm --cached -r packages/ag-grid-aurelia-example/scripts/
git rm --cached -r packages/ag-grid-enterprise/dist/
git rm --cached -r packages/ag-grid-react/lib/**
git rm --cached packages/ag-grid-react/umd/ag-grid-react.min.js
git rm --cached -r packages/ag-grid-vue/lib/**
git rm --cached packages/ag-grid-vue/main.js

git rm --cached packages/ag-grid-angular/main.js
git rm --cached packages/ag-grid-angular/main.d.ts
git rm --cached packages/ag-grid-angular/main.metadata.json

git rm --cached packages/ag-grid-enterprise/main.d.ts
git rm --cached packages/ag-grid-enterprise/main.js

git rm --cached -r packages/ag-grid/dist/styles/*.css
git rm --cached packages/ag-grid/ag-grid.d.ts
git rm --cached packages/ag-grid/ag-grid.js
git rm --cached packages/ag-grid/dist/ag-grid.js
git rm --cached packages/ag-grid/dist/ag-grid.min.js
git rm --cached packages/ag-grid/dist/ag-grid.min.noStyle.js
git rm --cached packages/ag-grid/dist/ag-grid.noStyle.js

git rm --cached packages/ag-grid-vue/dist/agGridVue.js
git rm --cached packages/ag-grid-vue/dist/vueComponentFactory.js
git rm --cached packages/ag-grid-vue/dist/vueFrameworkComponentWrapper.js
git rm --cached packages/ag-grid-vue/dist/vueFrameworkFactory.js
git rm --cached packages/ag-grid/main.d.ts
git rm --cached packages/ag-grid/main.js

git rm --cached packages/ag-grid-angular/exports.d.ts
git rm --cached packages/ag-grid-angular/exports.js
git rm --cached packages/ag-grid-angular/exports.js.map
git rm --cached packages/ag-grid-angular/exports.metadata.json
