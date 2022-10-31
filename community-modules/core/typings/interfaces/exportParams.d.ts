import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { RowNode } from "../entities/rowNode";
import { RowPosition } from "../entities/rowPosition";
import { AgGridCommon } from "./iCommon";
export interface BaseExportParams {
    /**
     * If `true`, all columns will be exported in the order they appear in the columnDefs.
     * When `false` only the columns currently being displayed will be exported.
     * Default: `false`
     */
    allColumns?: boolean;
    /**
     * Provide a list (an array) of column keys or Column objects if you want to export specific columns.
     */
    columnKeys?: (string | Column)[];
    /** Row node positions. */
    rowPositions?: RowPosition[];
    /**
     * String to use as the file name.
     */
    fileName?: string;
    /**
     * Determines whether rows are exported before being filtered and sorted.
     * Default: `filteredAndSorted`
     */
    exportedRows?: 'all' | 'filteredAndSorted';
    /**
     * Export only selected rows.
     * Default: `false`
     */
    onlySelected?: boolean;
    /**
     * Only export selected rows including other pages (only makes sense when using pagination).
     * Default: `false`
     */
    onlySelectedAllPages?: boolean;
    /**
     * Set to `true` to exclude header column groups.
     * Default: `false`
     */
    skipColumnGroupHeaders?: boolean;
    /**
     * Set to `true` if you don't want to export column headers.
     * Default: `false`
     */
    skipColumnHeaders?: boolean;
    /**
     * Set to `true` to skip row group headers if grouping rows. Only relevant when grouping rows.
     * Default: `false`
     */
    skipRowGroups?: boolean;
    /**
     * Set to `true` to suppress exporting rows pinned to the top of the grid.
     * Default: `false`
     */
    skipPinnedTop?: boolean;
    /**
     * Set to `true` to suppress exporting rows pinned to the bottom of the grid.
     * Default: `false`
     */
    skipPinnedBottom?: boolean;
    /**
     * A callback function that will be invoked once per row in the grid. Return true to omit the row from the export.
     */
    shouldRowBeSkipped?(params: ShouldRowBeSkippedParams): boolean;
    /**
     * A callback function invoked once per cell in the grid. Return a string value to be displayed in the export. For example this is useful for formatting date values.
     */
    processCellCallback?(params: ProcessCellForExportParams): string;
    /**
     * A callback function invoked once per column. Return a string to be displayed in the column header.
     */
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;
    /**
     * A callback function invoked once per column group. Return a `string` to be displayed in the column group header.
     * Note that column groups are exported by default, this option will not work with `skipColumnGroupHeaders=true`.
     */
    processGroupHeaderCallback?(params: ProcessGroupHeaderForExportParams): string;
    /**
     * A callback function invoked once per row group. Return a `string` to be displayed in the group cell.
     */
    processRowGroupCallback?(params: ProcessRowGroupForExportParams): string;
    /** @deprecated */
    columnGroups?: boolean;
    /** @deprecated */
    skipGroups?: boolean;
    /** @deprecated */
    skipHeader?: boolean;
}
export interface ExportParams<T> extends BaseExportParams {
    /**
     * Content to put at the top of the exported sheet.
     */
    prependContent?: T;
    /**
     * Content to put at the bottom of the exported sheet.
     */
    appendContent?: T;
    /**
     * @deprecated Use prependContent
     */
    customHeader?: T;
    /**
     * @deprecated Use appendContent
     */
    customFooter?: T;
    /** A callback function to return content to be inserted below a row in the export. */
    getCustomContentBelowRow?: (params: ProcessRowGroupForExportParams) => T | undefined;
}
export declare type PackageFileParams<T> = T & {
    data: string[];
};
export interface CsvCell {
    /** The data that will be added to the cell. */
    data: CsvCellData;
    /**
     * The number of cells to span across (1 means span 2 columns).
     * Default: `0`
     */
    mergeAcross?: number;
}
export interface CsvCellData {
    /** The value of the cell. */
    value: string | null;
}
export declare type CsvCustomContent = CsvCell[][] | string;
export interface CsvExportParams extends ExportParams<CsvCustomContent> {
    /**
     * Delimiter to insert between cell values.
     * Default: `,`
     */
    columnSeparator?: string;
    /**
     * By default cell values are encoded according to CSV format rules: values are wrapped in double quotes, and any double quotes within the values are escaped, so my value becomes \"my\"\"value\". Pass `true` to insert the value into the CSV file without escaping.
     * In this case it is your responsibility to ensure that no cells contain the columnSeparator character.
     * Default: `false`
     */
    suppressQuotes?: boolean;
}
export interface ShouldRowBeSkippedParams<TData = any> extends AgGridCommon<TData> {
    /** Row node. */
    node: RowNode<TData>;
}
export interface ProcessCellForExportParams<TData = any> extends AgGridCommon<TData> {
    value: any;
    accumulatedRowIndex?: number;
    node?: RowNode<TData> | null;
    column: Column;
    type: string;
}
export interface ProcessHeaderForExportParams<TData = any> extends AgGridCommon<TData> {
    column: Column;
}
export interface ProcessGroupHeaderForExportParams<TData = any> extends AgGridCommon<TData> {
    columnGroup: ColumnGroup;
}
export interface ProcessRowGroupForExportParams<TData = any> extends AgGridCommon<TData> {
    /** Row node. */
    node: RowNode<TData>;
}
