import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";

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
    node?: RowNode | null;
    column: Column;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
    type: string; // clipboard, dragCopy (ctrl+D), export
}

export interface ProcessHeaderForExportParams {
    column: Column;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
}