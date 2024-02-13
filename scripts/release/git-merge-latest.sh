#!/usr/bin/env bash

./scripts/release/git-merge-one-way.sh latest

git rm grid-examples/ag-grid-angular-cli-example
git rm grid-examples/ag-grid-angular-cli-package-example
git rm grid-examples/ag-grid-react-example
git rm grid-examples/ag-grid-react-package-example
git rm grid-examples/ag-grid-solid-example
git rm grid-examples/ag-grid-solid-package-example
git rm grid-examples/ag-grid-vue-example
git rm grid-examples/ag-grid-vue-package-example
git rm grid-examples/ag-grid-vue3-package-example
