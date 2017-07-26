// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./entities/column";
import { RowNode } from "./entities/rowNode";
import { GridApi } from "./gridApi";
import { ColumnApi } from "./columnController/columnController";
export interface BaseExportParams {
    skipHeader?: boolean;
    columnGroups?: boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
    skipPinnedTop?: boolean;
    skipPinnedBottom?: boolean;
    suppressQuotes?: boolean;
    columnKeys?: (string | Column)[];
    fileName?: string;
    allColumns?: boolean;
    onlySelected?: boolean;
    onlySelectedAllPages?: boolean;
    shouldRowBeSkipped?(params: ShouldRowBeSkippedParams): boolean;
    processCellCallback?(params: ProcessCellForExportParams): string;
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;
}
export interface ExportParams<T> extends BaseExportParams {
    customHeader?: T;
    customFooter?: T;
}
export interface CsvExportParams extends ExportParams<string> {
    columnSeparator?: string;
}
export interface ShouldRowBeSkippedParams {
    node: RowNode;
    api: GridApi;
    context: any;
}
export interface ProcessCellForExportParams {
    value: any;
    node: RowNode;
    column: Column;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
    type: string;
}
export interface ProcessHeaderForExportParams {
    column: Column;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
