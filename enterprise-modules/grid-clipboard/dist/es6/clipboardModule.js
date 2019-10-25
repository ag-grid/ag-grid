import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { ClipboardService } from "./clipboard/clipboardService";
export var ClipboardModule = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
