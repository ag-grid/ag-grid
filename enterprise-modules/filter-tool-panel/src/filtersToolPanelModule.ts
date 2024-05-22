import { Module, ModuleNames } from '@ag-grid-community/core';
import { AgGroupComponent, EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { AgFiltersToolPanelHeader } from './filterToolPanel/agFiltersToolPanelHeader';
import { AgFiltersToolPanelList } from './filterToolPanel/agFiltersToolPanelList';
import { FiltersToolPanel } from './filterToolPanel/filtersToolPanel';
import { VERSION } from './version';

export const FiltersToolPanelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [AgFiltersToolPanelHeader, AgFiltersToolPanelList, AgGroupComponent],
    userComponents: [{ componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel }],
    dependantModules: [SideBarModule, EnterpriseCoreModule],
};
