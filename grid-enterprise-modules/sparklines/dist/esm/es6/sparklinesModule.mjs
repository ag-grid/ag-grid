import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SparklineCellRenderer } from './sparklineCellRenderer.mjs';
import { SparklineTooltipSingleton } from './tooltip/sparklineTooltipSingleton.mjs';
import { VERSION } from './version.mjs';
export const SparklinesModule = {
    version: VERSION,
    moduleName: ModuleNames.SparklinesModule,
    beans: [SparklineTooltipSingleton],
    userComponents: [{ componentName: 'agSparklineCellRenderer', componentClass: SparklineCellRenderer }],
    dependantModules: [EnterpriseCoreModule],
};
