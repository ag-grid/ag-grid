import { ModuleNames, _ColumnFilterModule, _defineModule } from 'ag-grid-community';

import { SideBarModule } from '../sideBar/sideBarModule';
import { FiltersToolPanel } from './filtersToolPanel';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

export const FiltersToolPanelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: FiltersToolPanel }],
    dependantModules: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule],
});
