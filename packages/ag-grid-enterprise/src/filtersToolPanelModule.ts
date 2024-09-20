import { ModuleNames, _ColumnFilterModule, _defineModule } from 'ag-grid-community';
import { EnterpriseCoreModule } from './main';
import { SideBarModule } from './sideBarModule';

import { FiltersToolPanel } from './filterToolPanel/filtersToolPanel';
import { VERSION } from './version';

export const FiltersToolPanelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: FiltersToolPanel }],
    dependantModules: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule],
});
