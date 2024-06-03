import type { Module } from '@ag-grid-community/core';
import { ColumnFilterModule, FloatingFilterModule, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { SetFilter } from './setFilter/setFilter';
import { SetFloatingFilterComp } from './setFilter/setFloatingFilter';
import { VERSION } from './version';

export const SetFilterCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/set-filter-core',
    userComponents: [{ componentName: 'agSetColumnFilter', componentClass: SetFilter }],
    dependantModules: [EnterpriseCoreModule, ColumnFilterModule],
};

const SetFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/set-floating-filter',
    userComponents: [{ componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp }],
    dependantModules: [SetFilterCoreModule, FloatingFilterModule],
};

export const SetFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.SetFilterModule,
    dependantModules: [SetFilterCoreModule, SetFloatingFilterModule],
};
