import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SetFilter } from './setFilter/setFilter';
import { SetFloatingFilterComp } from './setFilter/setFloatingFilter';
import { CombinedFilter } from './combinedFilter/combinedFilter';
import { CombinedFloatingFilterComp } from './combinedFilter/combinedFloatingFilter';

export const SetFilterModule: Module = {
    moduleName: ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agSetColumnFilter', componentClass: SetFilter },
        { componentName: 'agCombinedColumnFilter', componentClass: CombinedFilter },
        { componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp },
        { componentName: 'agCombinedColumnFloatingFilter', componentClass: CombinedFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
