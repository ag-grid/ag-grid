import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ClipboardService } from "./clipboard/clipboardService";
export var ClipboardModule = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
