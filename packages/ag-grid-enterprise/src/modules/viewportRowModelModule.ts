import {Grid, Module, ModuleNames} from "ag-grid-community";
import {ViewportRowModel} from "../rowModels/viewport/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule
};

Grid.addModule([ViewportRowModelModule]);
Grid.addRowModelClass('viewport', ViewportRowModel);
