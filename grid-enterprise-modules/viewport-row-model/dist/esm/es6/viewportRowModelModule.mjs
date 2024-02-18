import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { VERSION } from "./version.mjs";
import { ViewportRowModel } from "./viewportRowModel/viewportRowModel.mjs";
export const ViewportRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
