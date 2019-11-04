import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/grid-core";
import {ViewportRowModel} from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: {'viewport': ViewportRowModel},
    dependantModules: [
        EnterpriseCoreModule
    ]
};

