import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { ColumnGroup } from "../entities/columnGroup";
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
    processGroupHeaderCallback?(params: ProcessGroupHeaderForExportParams): string;
    processRowGroupCallback?(params: ProcessRowGroupForExportParams): string;
}
export interface ExportParams<T> extends BaseExportParams {
    customHeader?: T;
    customFooter?: T;
    getCustomContentBelowRow?: (params: ProcessRowGroupForExportParams) => T | undefined;
}
export interface CsvCell {
    data: CsvCellData;
    mergeAcross?: number;
}
export interface CsvCellData {
    value: string | null;
}
export declare type CsvCustomContent = CsvCell[][] | string;
export interface CsvExportParams extends ExportParams<CsvCustomContent> {
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
    type: string;
}
export interface ProcessHeaderForExportParams {
    column: Column;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
}
export interface ProcessGroupHeaderForExportParams {
    columnGroup: ColumnGroup;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
}
export interface ProcessRowGroupForExportParams {
    node: RowNode;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
}
