import {Module, ModuleNames} from "@ag-community/grid-core";
import {ViewportRowModel} from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: {'viewport': ViewportRowModel}
};

