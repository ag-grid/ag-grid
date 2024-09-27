import { ColumnFilterModule, FloatingFilterModule, ModuleNames, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { SetFilter } from './setFilter';
import { SetFloatingFilterComp } from './setFloatingFilter';

export const SetFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.SetFilterModule}-core`,
    userComponents: [{ name: 'agSetColumnFilter', classImp: SetFilter }],
    dependantModules: [EnterpriseCoreModule, ColumnFilterModule],
});

const SetFloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/set-floating-filter',
    userComponents: [{ name: 'agSetColumnFloatingFilter', classImp: SetFloatingFilterComp }],
    dependantModules: [SetFilterCoreModule, FloatingFilterModule],
});

export const SetFilterModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.SetFilterModule,
    dependantModules: [SetFilterCoreModule, SetFloatingFilterModule],
});
