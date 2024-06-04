import type { Module } from '@ag-grid-community/core';
import { ColumnFilterModule, FloatingFilterModule, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { SetFilter } from './setFilter/setFilter';
import { SetFloatingFilterComp } from './setFilter/setFloatingFilter';
import { VERSION } from './version';

export const SetFilterCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/set-filter-core',
    userComponents: [{ name: 'agSetColumnFilter', classImp: SetFilter }],
    dependantModules: [EnterpriseCoreModule, ColumnFilterModule],
};

const SetFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/set-floating-filter',
    userComponents: [{ name: 'agSetColumnFloatingFilter', classImp: SetFloatingFilterComp }],
    dependantModules: [SetFilterCoreModule, FloatingFilterModule],
};

export const SetFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.SetFilterModule,
    dependantModules: [SetFilterCoreModule, SetFloatingFilterModule],
};
