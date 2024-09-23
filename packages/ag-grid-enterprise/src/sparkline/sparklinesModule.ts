import { ModuleNames, _defineModule } from 'ag-grid-community';

import { SparklineCellRenderer } from './sparklineCellRenderer';
import { SparklineTooltipSingleton } from './tooltip/sparklineTooltipSingleton';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

export const SparklinesModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.SparklinesModule,
    beans: [SparklineTooltipSingleton],
    userComponents: [{ name: 'agSparklineCellRenderer', classImp: SparklineCellRenderer }],
    dependantModules: [EnterpriseCoreModule],
});
