import {Grid, Module, ModuleNames} from "ag-grid-community";
import {ViewportRowModel} from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: {'viewport': ViewportRowModel}
};

Grid.addModule([ViewportRowModelModule]);
