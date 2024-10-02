import type { Module } from 'ag-grid-community';
import { ColumnFilterModule, FloatingFilterModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { SetFilter } from './setFilter';
import { SetFloatingFilterComp } from './setFloatingFilter';

export const SetFilterCoreModule: Module = {
    ...baseEnterpriseModule('SetFilterCoreModule'),
    userComponents: [{ name: 'agSetColumnFilter', classImp: SetFilter }],
    dependsOn: [EnterpriseCoreModule, ColumnFilterModule],
};

const SetFloatingFilterModule: Module = {
    ...baseEnterpriseModule('SetFloatingFilterModule'),
    userComponents: [{ name: 'agSetColumnFloatingFilter', classImp: SetFloatingFilterComp }],
    dependsOn: [SetFilterCoreModule, FloatingFilterModule],
};

export const SetFilterModule: Module = {
    ...baseEnterpriseModule(ModuleNames.SetFilterModule),
    dependsOn: [SetFilterCoreModule, SetFloatingFilterModule],
};
