import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { FiltersToolPanelHeaderPanel } from "./filterToolPanel/filtersToolPanelHeaderPanel";
import { FiltersToolPanelListPanel } from "./filterToolPanel/filtersToolPanelListPanel";
import { FiltersToolPanel } from "./filterToolPanel/filtersToolPanel";
import { SideBarModule } from "@ag-enterprise/grid-side-bar";
export var FiltersToolPanelModule = {
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
