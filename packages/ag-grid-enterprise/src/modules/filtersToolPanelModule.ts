import {Grid, Module, ModuleNames} from "ag-grid-community";

export const FiltersToolPanelModule: Module = {
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: []
};

Grid.addModule([FiltersToolPanelModule]);
