import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/grid-core";
import {FiltersToolPanelHeaderPanel} from "./filterToolPanel/filtersToolPanelHeaderPanel";
import {FiltersToolPanelListPanel} from "./filterToolPanel/filtersToolPanelListPanel";
import {FiltersToolPanel} from "./filterToolPanel/filtersToolPanel";
import {SideBarModule} from "@ag-grid-enterprise/grid-side-bar";

export const FiltersToolPanelModule: Module = {
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        {componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel},
        {componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel}
    ],
    userComponents: [
        {componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel},
    ],
    dependantModules: [
        SideBarModule,
        EnterpriseCoreModule
    ]
};

