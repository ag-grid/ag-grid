import type { Module } from 'ag-grid-community';
import { CommunityFeaturesModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { ViewportRowModel } from './viewportRowModel';

export const ViewportRowModelModule: Module = {
    ...baseEnterpriseModule(ModuleNames.ViewportRowModelModule),
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependsOn: [EnterpriseCoreModule, CommunityFeaturesModule],
};
