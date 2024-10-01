import { ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { SparklineCellRenderer } from './sparklineCellRenderer';
import { SparklineTooltipSingleton } from './tooltip/sparklineTooltipSingleton';

export const SparklinesModule = defineEnterpriseModule(ModuleNames.SparklinesModule, {
    beans: [SparklineTooltipSingleton],
    userComponents: [{ name: 'agSparklineCellRenderer', classImp: SparklineCellRenderer }],
    dependsOn: [EnterpriseCoreModule],
});
