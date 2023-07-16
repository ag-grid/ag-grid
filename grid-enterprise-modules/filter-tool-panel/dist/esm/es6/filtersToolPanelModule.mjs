import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { FiltersToolPanelHeaderPanel } from "./filterToolPanel/filtersToolPanelHeaderPanel.mjs";
import { FiltersToolPanelListPanel } from "./filterToolPanel/filtersToolPanelListPanel.mjs";
import { FiltersToolPanel } from "./filterToolPanel/filtersToolPanel.mjs";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { VERSION } from "./version.mjs";
export const FiltersToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel },
    ],
    dependantModules: [
        SideBarModule,
        EnterpriseCoreModule
    ]
};
