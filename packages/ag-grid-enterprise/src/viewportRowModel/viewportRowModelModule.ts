import type { _ModuleWithoutApi } from 'ag-grid-community';
import { CommunityFeaturesModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { ViewportRowModel } from './viewportRowModel';

export const ViewportRowModelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule(ModuleNames.ViewportRowModelModule),
    rowModels: ['viewport'],
    beans: [ViewportRowModel],
    dependsOn: [EnterpriseCoreModule, CommunityFeaturesModule],
};
