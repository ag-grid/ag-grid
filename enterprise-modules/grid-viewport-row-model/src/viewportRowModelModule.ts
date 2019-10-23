import {Module, ModuleNames} from "@ag-community/grid-core";
import {EnterpriseCoreModule} from "@ag-enterprise/grid-core";
import {ViewportRowModel} from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: {'viewport': ViewportRowModel},
    dependantModules: [
        EnterpriseCoreModule
    ]
};

