import { ModuleNames } from "@ag-grid-community/core";
import { CsvCreator } from "./csvExport/csvCreator.mjs";
import { GridSerializer } from "./csvExport/gridSerializer.mjs";
import { VERSION } from "./version.mjs";
export const CsvExportModule = {
    version: VERSION,
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, GridSerializer]
};
