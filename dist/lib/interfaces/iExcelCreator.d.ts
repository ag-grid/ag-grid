// Type definitions for ag-grid v7.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { CsvExportParams } from "../exportParams";
export interface IExcelCreator {
    exportDataAsExcel(params?: CsvExportParams): void;
    getDataAsExcelXml(params?: CsvExportParams): string;
}
