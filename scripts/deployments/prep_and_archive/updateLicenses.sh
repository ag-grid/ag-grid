#!/bin/bash

SOURCE_COMMUNITY_LICENSE=./packages/ag-grid-community/LICENSE.txt

COMMUNITY_DIRS=("ag-grid-angular" "ag-grid-react" "ag-grid-vue3")

for directory in "${COMMUNITY_DIRS[@]}";
do
  cp $SOURCE_COMMUNITY_LICENSE "./packages/$directory"
done

# documentation/ag-grid-docs/public/eula/AG-Grid-Enterprise-License-Latest.html is the golden source for the enterprise license
cp documentation/ag-grid-docs/public/eula/AG-Grid-Enterprise-License-Latest.html packages/ag-grid-enterprise/LICENSE.html
