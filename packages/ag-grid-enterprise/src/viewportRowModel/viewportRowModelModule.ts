import { CommunityFeaturesModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { ViewportRowModel } from './viewportRowModel';

export const ViewportRowModelModule = defineEnterpriseModule(ModuleNames.ViewportRowModelModule, {
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependsOn: [EnterpriseCoreModule, CommunityFeaturesModule],
});
