// Type definitions for @ag-grid-community/core v31.0.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { CsvExportParams } from "./exportParams";
export interface ICsvCreator {
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): string;
    exportDataAsCsv(params?: CsvExportParams): string;
}
