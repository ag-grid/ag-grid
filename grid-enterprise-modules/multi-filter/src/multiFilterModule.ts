import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { MultiFilter } from './multiFilter/multiFilter';
import { MultiFloatingFilterComp } from './multiFilter/multiFloatingFilter';
import { VERSION } from './version';

export const MultiFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MultiFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agMultiColumnFilter', componentClass: MultiFilter },
        { componentName: 'agMultiColumnFloatingFilter', componentClass: MultiFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
