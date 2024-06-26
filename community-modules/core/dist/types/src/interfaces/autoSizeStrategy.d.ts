/** Limit a column width when auto-sizing to fit grid width. */
export interface SizeColumnsToFitGridColumnLimits {
    colId: string;
    /** Minimum width for this column (does not override the column minimum width) */
    minWidth?: number;
    /** Maximum width for this column (does not override the column maximum width) */
    maxWidth?: number;
}
/** Auto-size columns to fit the grid width. */
export interface SizeColumnsToFitGridStrategy {
    type: 'fitGridWidth';
    /** Default minimum width for every column (does not override the column minimum width). */
    defaultMinWidth?: number;
    /** Default maximum width for every column (does not override the column maximum width). */
    defaultMaxWidth?: number;
    /** Provide to limit specific column widths when sizing. */
    columnLimits?: SizeColumnsToFitGridColumnLimits[];
}
/** Auto-size columns to fit a provided width. */
export interface SizeColumnsToFitProvidedWidthStrategy {
    type: 'fitProvidedWidth';
    width: number;
}
/**
 * Auto-size columns to fit their cell contents.
 * Only works for Client-Side Row Model and Server-Side Row Model.
 */
export interface SizeColumnsToContentStrategy {
    type: 'fitCellContents';
    /** If true, the header won't be included when calculating the column widths. */
    skipHeader?: boolean;
    /** If not provided will auto-size all columns. Otherwise will size the specified columns. */
    colIds?: string[];
}
