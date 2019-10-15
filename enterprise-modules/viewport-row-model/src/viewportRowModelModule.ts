import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {ViewportRowModel} from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: {'viewport': ViewportRowModel}
};

ModuleRegistry.register(ViewportRowModelModule);
