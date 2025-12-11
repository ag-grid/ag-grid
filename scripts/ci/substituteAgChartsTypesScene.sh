#!/bin/bash

set -eu

if [[ $(uname) == "Darwin" ]] ; then
    find ./packages/**/src -name \*.ts | xargs sed -e "s/'ag-charts-types\/scene'/'ag-charts-community\/scene'/" -i ''
else
    find ./packages/**/src -name \*.ts | xargs sed -e "s/'ag-charts-types\/scene'/'ag-charts-community\/scene'/" -i''
fi

git apply <<EOF
diff --git a/packages/ag-grid-enterprise/src/agStack/iAgChartsExports.ts b/packages/ag-grid-enterprise/src/agStack/iAgChartsExports.ts
index e485b6842b4..f1c404e68a6 100644
--- a/packages/ag-grid-enterprise/src/agStack/iAgChartsExports.ts
+++ b/packages/ag-grid-enterprise/src/agStack/iAgChartsExports.ts
@@ -1,7 +1,7 @@
-import type { IntegratedModule } from 'ag-charts-types';
+import type { AgChartsCommunityModule } from 'ag-charts-community';
 
 /** MAKE SURE TO UPDATE THE SCRIPT scripts/ci/substituteAgChartsTypesScene.sh WHEN CHANGING THIS FILE */
-type ChartTypes = IntegratedModule;
+type ChartTypes = typeof AgChartsCommunityModule;
 
 export interface IAgChartsExports {
     readonly beanName: 'agChartsExports';
diff --git a/packages/ag-grid-enterprise/src/charts/agChartsExports.ts b/packages/ag-grid-enterprise/src/charts/agChartsExports.ts
index 915327e8ab8..493c5ac9697 100644
--- a/packages/ag-grid-enterprise/src/charts/agChartsExports.ts
+++ b/packages/ag-grid-enterprise/src/charts/agChartsExports.ts
@@ -1,4 +1,4 @@
-import type { IntegratedModule } from 'ag-charts-types';
+import type { AgChartsCommunityModule, IntegratedModule } from 'ag-charts-community';
 
 import type { NamedBean } from 'ag-grid-community';
 import { BeanStub } from 'ag-grid-community';
@@ -6,7 +6,7 @@ import { BeanStub } from 'ag-grid-community';
 import type { IAgChartsExports } from '../agStack/iAgChartsExports';
 
 /** MAKE SURE TO UPDATE THE SCRIPT scripts/ci/substituteAgChartsTypesScene.sh WHEN CHANGING THIS FILE */
-type ChartTypes = IntegratedModule;
+type ChartTypes = typeof AgChartsCommunityModule;
 
 /** Bean to expose the AG Charts apis from a single location and not require a code dependency on ag-charts-community */
 export class AgChartsExports extends BeanStub implements NamedBean, IAgChartsExports {
EOF
