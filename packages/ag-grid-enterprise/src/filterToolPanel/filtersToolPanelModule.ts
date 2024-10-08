import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { SideBarModule } from '../sideBar/sideBarModule';
import { FiltersToolPanel } from './filtersToolPanel';

export const FiltersToolPanelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('FiltersToolPanelModule'),
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: FiltersToolPanel }],
    dependsOn: [SideBarModule, EnterpriseCoreModule, ColumnFilterModule],
};
