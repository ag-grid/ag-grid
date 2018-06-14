#!/usr/bin/env bash

# to be run in the root directory, and this only really makes sense when NOT ON MASTER!

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

#git update-index --skip-worktree dist/
#git update-index --skip-worktree packages/ag-grid-angular/dist/
#git update-index --skip-worktree packages/ag-grid-angular/main.js.map
#git update-index --skip-worktree packages/ag-grid-aurelia/lib/
#git update-index --skip-worktree packages/ag-grid-enterprise/dist/
#git update-index --skip-worktree packages/ag-grid/dist/lib/
#git update-index --skip-worktree packages/ag-grid/dist/ag-grid.js
#git update-index --skip-worktree packages/ag-grid/dist/ag-grid.min.js
#git update-index --skip-worktree packages/ag-grid/dist/ag-grid.min.noStyle.js
#git update-index --skip-worktree packages/ag-grid/dist/ag-grid.noStyle.js
