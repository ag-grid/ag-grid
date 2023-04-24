import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { VERSION } from "./version";
import { ViewportRowModel } from "./viewportRowModel/viewportRowModel";

export const ViewportRowModelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
