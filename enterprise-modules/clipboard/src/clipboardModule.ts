import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {ClipboardService} from "./clipboard/clipboardService";

export const ClipboardModule: Module = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService]
};

ModuleRegistry.register(ClipboardModule);
