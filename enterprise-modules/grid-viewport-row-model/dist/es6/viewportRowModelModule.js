import { ModuleNames } from "@ag-grid-community/grid-core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/grid-core";
import { ViewportRowModel } from "./viewportRowModel/viewportRowModel";
export var ViewportRowModelModule = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: { 'viewport': ViewportRowModel },
    dependantModules: [
        EnterpriseCoreModule
    ]
};
