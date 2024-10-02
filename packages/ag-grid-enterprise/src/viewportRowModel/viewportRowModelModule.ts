import { CommunityFeaturesModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { ViewportRowModel } from './viewportRowModel';

export const ViewportRowModelModule = defineEnterpriseModule(ModuleNames.ViewportRowModelModule, {
    rowModels: ['viewport'],
    beans: [ViewportRowModel],
    dependsOn: [EnterpriseCoreModule, CommunityFeaturesModule],
});
