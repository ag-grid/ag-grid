// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { CsvExportParams } from "./exportParams";
export interface ICsvCreator {
    getDataAsCsv(params?: CsvExportParams): string;
    exportDataAsCsv(params?: CsvExportParams): string;
}
