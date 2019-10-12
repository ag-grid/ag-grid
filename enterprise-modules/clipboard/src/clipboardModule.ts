import {Grid, Module, ModuleNames} from "ag-grid-community";
import {ClipboardService} from "./clipboard/clipboardService";

export const ClipboardModule: Module = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService]
};

Grid.addModule([ClipboardModule]);
