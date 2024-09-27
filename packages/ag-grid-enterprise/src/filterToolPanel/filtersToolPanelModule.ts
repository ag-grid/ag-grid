import { ModuleNames, _ColumnFilterModule, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { VERSION } from '../version';
import { FiltersToolPanel } from './filtersToolPanel';

export const FiltersToolPanelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: FiltersToolPanel }],
    dependantModules: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule],
});
