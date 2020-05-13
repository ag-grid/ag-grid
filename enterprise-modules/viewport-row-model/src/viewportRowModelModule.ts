import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule} from "@ag-grid-enterprise/core";
import { ViewportRowModel } from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: {'viewport': ViewportRowModel},
    dependantModules: [
        EnterpriseCoreModule
    ]
};

