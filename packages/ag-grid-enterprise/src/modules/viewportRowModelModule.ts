import {Grid, Module, ModuleNames} from "ag-grid-community";
import {ViewportRowModel} from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule
};

Grid.addModule([ViewportRowModelModule]);
Grid.addRowModelClass('viewport', ViewportRowModel);
