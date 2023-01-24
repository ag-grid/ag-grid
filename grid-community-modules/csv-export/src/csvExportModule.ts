import { Module, ModuleNames } from "@ag-grid-community/core";
import { CsvCreator } from "./csvExport/csvCreator";
import { GridSerializer } from "./csvExport/gridSerializer";
import { VERSION } from "./version";

export const CsvExportModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, GridSerializer]
};
