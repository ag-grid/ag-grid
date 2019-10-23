import {Module, ModuleNames} from "@ag-community/grid-core";
import {EnterpriseCoreModule} from "@ag-enterprise/grid-core";
import {ClipboardService} from "./clipboard/clipboardService";

export const ClipboardModule: Module = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

