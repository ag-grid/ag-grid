import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {FiltersToolPanelHeaderPanel} from "./filterToolPanel/filtersToolPanelHeaderPanel";
import {FiltersToolPanelListPanel} from "./filterToolPanel/filtersToolPanelListPanel";
import {FiltersToolPanel} from "./filterToolPanel/filtersToolPanel";

export const FiltersToolPanelModule: Module = {
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        {componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel},
        {componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel}
    ],
    userComponents: [
        {componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel},
    ]
};

ModuleRegistry.register(FiltersToolPanelModule);
