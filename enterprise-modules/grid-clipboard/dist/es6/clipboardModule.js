import { ModuleNames } from "@ag-grid-community/grid-core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/grid-core";
import { ClipboardService } from "./clipboard/clipboardService";
export var ClipboardModule = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
