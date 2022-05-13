import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { RowNode } from "../entities/rowNode";
import { RowPosition } from "../entities/rowPosition";
import { AgGridCommon } from "./iCommon";
export interface BaseExportParams {
    allColumns?: boolean;
    columnKeys?: (string | Column)[];
    rowNodes?: RowPosition[];
    fileName?: string;
    onlySelected?: boolean;
    onlySelectedAllPages?: boolean;
    skipColumnGroupHeaders?: boolean;
    skipColumnHeaders?: boolean;
    skipRowGroups?: boolean;
    skipPinnedTop?: boolean;
    skipPinnedBottom?: boolean;
    shouldRowBeSkipped?(params: ShouldRowBeSkippedParams): boolean;
    processCellCallback?(params: ProcessCellForExportParams): string;
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;
    processGroupHeaderCallback?(params: ProcessGroupHeaderForExportParams): string;
    processRowGroupCallback?(params: ProcessRowGroupForExportParams): string;
    /** @deprecated */
    columnGroups?: boolean;
    /** @deprecated */
    skipGroups?: boolean;
    /** @deprecated */
    skipHeader?: boolean;
}
export interface ExportParams<T> extends BaseExportParams {
    prependContent?: T;
    appendContent?: T;
    /**
     * @deprecated Use prependContent
     */
    customHeader?: T;
    /**
     * @deprecated Use appendContent
     */
    customFooter?: T;
    getCustomContentBelowRow?: (params: ProcessRowGroupForExportParams) => T | undefined;
}
export declare type PackageFileParams<T> = T & {
    data: string[];
};
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
    suppressQuotes?: boolean;
}
export interface ShouldRowBeSkippedParams extends AgGridCommon {
    node: RowNode;
}
export interface ProcessCellForExportParams extends AgGridCommon {
    value: any;
    accumulatedRowIndex?: number;
    node?: RowNode | null;
    column: Column;
    type: string;
}
export interface ProcessHeaderForExportParams extends AgGridCommon {
    column: Column;
}
export interface ProcessGroupHeaderForExportParams extends AgGridCommon {
    columnGroup: ColumnGroup;
}
export interface ProcessRowGroupForExportParams extends AgGridCommon {
    node: RowNode;
}
