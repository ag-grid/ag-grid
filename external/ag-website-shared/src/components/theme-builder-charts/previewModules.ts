import type { ModuleDefinition } from 'ag-charts-core';
import { AllCartesianModule, AllCommunityModule, AllPolarModule, FinancialChartModule } from 'ag-charts-enterprise';

/**
 * What the preview charts are allowed to draw. Enterprise, for the navigator,
 * toolbars and context menu; named bundles rather than `AllEnterpriseModule`, to
 * keep maps, topology, gauges and tree series out of a page that shows none.
 */
export const PREVIEW_MODULES: ModuleDefinition[] = [
    AllCommunityModule,
    AllCartesianModule,
    AllPolarModule,
    FinancialChartModule,
].flat();
