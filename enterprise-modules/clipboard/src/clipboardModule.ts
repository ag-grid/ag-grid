import {Module, ModuleNames} from "@ag-grid-community/core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/core";
import {CsvExportModule} from "@ag-grid-community/csv-export";
import {ClipboardService} from "./clipboard/clipboardService";

export const ClipboardModule: Module = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule,
        CsvExportModule
    ]
};

