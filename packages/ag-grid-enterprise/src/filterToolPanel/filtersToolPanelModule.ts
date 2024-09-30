import { ColumnFilterModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { SideBarModule } from '../sideBar/sideBarModule';
import { FiltersToolPanel } from './filtersToolPanel';

export const FiltersToolPanelModule = defineEnterpriseModule(ModuleNames.FiltersToolPanelModule, {
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: FiltersToolPanel }],
    dependsOn: [SideBarModule, EnterpriseCoreModule, ColumnFilterModule],
});
