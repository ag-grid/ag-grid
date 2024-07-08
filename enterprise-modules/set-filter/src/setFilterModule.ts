import { ModuleNames, _ColumnFilterModule, _FloatingFilterModule, _defineModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { SetFilter } from './setFilter/setFilter';
import { SetFloatingFilterComp } from './setFilter/setFloatingFilter';
import { VERSION } from './version';

export const SetFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.SetFilterModule}-core`,
    userComponents: [{ name: 'agSetColumnFilter', classImp: SetFilter }],
    dependantModules: [EnterpriseCoreModule, _ColumnFilterModule],
});

const SetFloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/set-floating-filter',
    userComponents: [{ name: 'agSetColumnFloatingFilter', classImp: SetFloatingFilterComp }],
    dependantModules: [SetFilterCoreModule, _FloatingFilterModule],
});

export const SetFilterModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.SetFilterModule,
    dependantModules: [SetFilterCoreModule, SetFloatingFilterModule],
});
