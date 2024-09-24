import {
    ModuleNames,
    _ColumnFilterModule,
    _ReadOnlyFloatingFilterModule,
    _defineModule,
} from 'ag-grid-community';

import { MultiFilter } from './multiFilter';
import { MultiFloatingFilterComp } from './multiFloatingFilter';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';

export const MultiFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.MultiFilterModule}-core`,
    userComponents: [
        { name: 'agMultiColumnFilter', classImp: MultiFilter },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependantModules: [EnterpriseCoreModule, _ColumnFilterModule],
});

const MultiFloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/multi-floating-filter',
    userComponents: [{ name: 'agMultiColumnFloatingFilter', classImp: MultiFloatingFilterComp }],
    dependantModules: [MultiFilterCoreModule, _ReadOnlyFloatingFilterModule],
});

export const MultiFilterModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.MultiFilterModule,
    dependantModules: [MultiFilterCoreModule, MultiFloatingFilterModule],
});
