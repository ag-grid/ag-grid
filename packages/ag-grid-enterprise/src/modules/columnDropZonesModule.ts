import {Grid, Module, ModuleNames} from "ag-grid-community";
import {GridHeaderDropZones} from "./columnDropZones/gridHeaderDropZones";

export const ColumnDropZonesModule: Module = {
    moduleName: ModuleNames.ColumnDropZonesModule,
    beans: [],
    agStackComponents: [{componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones}]
};

Grid.addModule([ColumnDropZonesModule]);
