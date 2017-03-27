import {ColDef} from "./entities/colDef";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {GridApi} from "./gridApi";
import {ColumnApi} from "./columnController/columnController";

export interface ExportParams {
    skipHeader?: boolean;
    columnGroups?:boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
    skipFloatingTop?: boolean;
    skipFloatingBottom?: boolean;
    suppressQuotes?: boolean;
    columnKeys?: (Column|ColDef|string)[]
    fileName?: string;
    allColumns?: boolean;
    onlySelected?: boolean;
    onlySelectedAllPages?: boolean;
    shouldRowBeSkipped?(params: ShouldRowBeSkippedParams): boolean;
    processCellCallback?(params: ProcessCellForExportParams): string;
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;
}

export interface CsvExportParams extends ExportParams{
    customHeader?: string;
    customFooter?: string;
    columnSeparator?: string;
}

export interface ShouldRowBeSkippedParams {
    node: RowNode,
    api: GridApi,
    context: any
}

export interface ProcessCellForExportParams {
    value: any,
    node: RowNode,
    column: Column,
    api: GridApi,
    columnApi: ColumnApi,
    context: any
}

export interface ProcessHeaderForExportParams {
    column: Column,
    api: GridApi,
    columnApi: ColumnApi,
    context: any
}