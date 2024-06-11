import type { Module } from '@ag-grid-community/core';
import { ModuleNames, _ColumnFilterModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { FiltersToolPanel } from './filterToolPanel/filtersToolPanel';
import { VERSION } from './version';

export const FiltersToolPanelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: FiltersToolPanel }],
    dependantModules: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule],
};
