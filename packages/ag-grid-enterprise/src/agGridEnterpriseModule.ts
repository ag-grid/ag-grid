import type { _ModuleWithoutApi } from 'ag-grid-community';

import { AggregationModule } from './aggregation/aggregationModule';
import { LoadingCellRendererModule, SkeletonCellRendererModule } from './cellRenderers/enterpriseCellRendererModule';
import { ClientSideRowModelExpansionModule } from './expansion/expansionModule';
import { GridLicenseManager as LicenseManager } from './license/gridLicenseManager';
import { baseEnterpriseModule } from './moduleUtils';
import { AgMenuItemRenderer } from './widgets/agMenuItemRenderer';

export { AgWatermark } from './license/watermark';

export const EnterpriseCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('EnterpriseCoreModule'),
    beans: [LicenseManager],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependsOn: [
        AggregationModule,
        ClientSideRowModelExpansionModule,
        LoadingCellRendererModule,
        SkeletonCellRendererModule,
    ],
};
