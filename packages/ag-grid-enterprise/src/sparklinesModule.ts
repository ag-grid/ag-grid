import { ModuleNames, _defineModule } from 'ag-grid-community';
import { EnterpriseCoreModule } from './main';

import { SparklineCellRenderer } from './sparklineCellRenderer';
import { SparklineTooltipSingleton } from './tooltip/sparklineTooltipSingleton';
import { VERSION } from './version';

export const SparklinesModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.SparklinesModule,
    beans: [SparklineTooltipSingleton],
    userComponents: [{ name: 'agSparklineCellRenderer', classImp: SparklineCellRenderer }],
    dependantModules: [EnterpriseCoreModule],
});
