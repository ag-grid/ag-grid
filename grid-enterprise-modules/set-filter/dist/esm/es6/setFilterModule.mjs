import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SetFilter } from './setFilter/setFilter.mjs';
import { SetFloatingFilterComp } from './setFilter/setFloatingFilter.mjs';
import { VERSION } from './version.mjs';
export const SetFilterModule = {
    version: VERSION,
    moduleName: ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agSetColumnFilter', componentClass: SetFilter },
        { componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
