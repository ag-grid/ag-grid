import { Module, ModuleNames } from "@ag-grid-community/core";
import { CsvCreator } from "./csvExport/csvCreator";
import { GridSerializer } from "./csvExport/gridSerializer";

export const CsvExportModule: Module = {
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, GridSerializer]
};
