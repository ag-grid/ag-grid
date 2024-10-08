import type { _ModuleWithoutApi } from 'ag-grid-community';
import { CommunityFeaturesModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { ViewportRowModel } from './viewportRowModel';

export const ViewportRowModelCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ViewportRowModelCoreModule'),
    rowModels: ['viewport'],
    beans: [ViewportRowModel],
    dependsOn: [EnterpriseCoreModule],
};

export const ViewportRowModelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ViewportRowModelModule'),
    rowModels: ['viewport'],
    beans: [],
    dependsOn: [ViewportRowModelCoreModule, CommunityFeaturesModule],
};
