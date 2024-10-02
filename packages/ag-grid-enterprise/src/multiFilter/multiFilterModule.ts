import type { Module } from 'ag-grid-community';
import { ColumnFilterModule, ModuleNames, ReadOnlyFloatingFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { MultiFilter } from './multiFilter';
import { MultiFloatingFilterComp } from './multiFloatingFilter';

export const MultiFilterCoreModule: Module = {
    ...baseEnterpriseModule('MultiFilterCoreModule'),
    userComponents: [
        { name: 'agMultiColumnFilter', classImp: MultiFilter },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependsOn: [EnterpriseCoreModule, ColumnFilterModule],
};

const MultiFloatingFilterModule: Module = {
    ...baseEnterpriseModule('MultiFloatingFilterModule'),
    userComponents: [{ name: 'agMultiColumnFloatingFilter', classImp: MultiFloatingFilterComp }],
    dependsOn: [MultiFilterCoreModule, ReadOnlyFloatingFilterModule],
};

export const MultiFilterModule: Module = {
    ...baseEnterpriseModule(ModuleNames.MultiFilterModule),
    dependsOn: [MultiFilterCoreModule, MultiFloatingFilterModule],
};
