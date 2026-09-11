#!/bin/bash

SOURCE_COMMUNITY_LICENSE=./packages/ag-grid-community/LICENSE.txt

COMMUNITY_DIRS=("ag-grid-angular" "ag-grid-react" "ag-grid-vue3")

for directory in "${COMMUNITY_DIRS[@]}";
do
  cp $SOURCE_COMMUNITY_LICENSE "./packages/$directory"
done

# The End User Licence Agreement published at https://www.ag-grid.com/eula/ is the golden source for
# the enterprise licence. Render it into the package as LICENSE.md and LICENSE.html.
(cd documentation/ag-grid-docs && npx tsx scripts/licence/generate-enterprise-licence.ts)
