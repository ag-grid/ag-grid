import type { Column } from './iColumn';
import type { AgGridCommon } from './iCommon';

interface WidthLimits {
    /** Defines a minimum width for this column (does not override the column minimum width) */
    minWidth?: number;
    /** Defines a maximum width for this column (does not override the column maximum width) */
    maxWidth?: number;
}

interface DefaultWidthLimits {
    /** Defines a default minimum width for every column (does not override the column minimum width) */
    defaultMinWidth?: number;
    /** Defines a default maximum width for every column (does not override the column maximum width) */
    defaultMaxWidth?: number;
}

export interface IColumnLimit extends WidthLimits {
    /** Selector for the column to which these dimension limits will apply */
    key: Column | string;
}

export interface ISizeColumnsToFitParams extends DefaultWidthLimits {
    /** Provides a minimum and/or maximum width to specific columns */
    columnLimits?: IColumnLimit[];
}

/** Limit a column width when auto-sizing to fit grid width. */
export interface SizeColumnsToFitGridColumnLimits extends WidthLimits {
    colId: string;
}

/** Auto-size columns to fit the grid width. */
export interface SizeColumnsToFitGridStrategy<TData = any, TContext = any>
    extends DefaultWidthLimits, ContinuousAutoSizeOptions<TData, TContext> {
    type: 'fitGridWidth';
    /** Provide to limit specific column widths when sizing. */
    columnLimits?: SizeColumnsToFitGridColumnLimits[];
}

/** Auto-size columns to fit a provided width. */
export interface SizeColumnsToFitProvidedWidthStrategy<TData = any, TContext = any> extends ContinuousAutoSizeOptions<
    TData,
    TContext
> {
    type: 'fitProvidedWidth';
    width: number;
}

export interface SizeColumnsToContentColumnLimits extends WidthLimits {
    colId: string;
}

/** Params for the `shouldAutoSizeColumns` callback of a continuous auto-size strategy. */
export interface AutoSizeColumnsTriggerParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** What changed in the grid to make it want to re-size columns. */
    reason: 'dataChanged' | 'columnsChanged' | 'viewportChanged' | 'gridSizeChanged';
    /**
     * All eligible columns — those the user has not resized, and not otherwise excluded.
     * For `fitCellContents`, the grid may only be able to measure the subset that is currently rendered.
     */
    columns: Column[];
}

/** Opt-in re-running of an auto-size strategy, shared by every strategy type. */
export interface ContinuousAutoSizeOptions<TData = any, TContext = any> {
    /**
     * If `true`, the strategy is re-applied whenever the grid changes in a way that affects column widths,
     * not only on first render. Every type responds to displayed-column changes and to grid resizes. Beyond
     * that, `fitCellContents` responds to any row data change and to viewport changes, because both change
     * what there is to measure, while the width-distribution strategies respond to new data, a page change
     * and a scrollbar appearing or disappearing — the changes to the width there is to share out.
     * Viewport and grid-size changes are debounced, so scrolling or resizing the grid re-sizes once the
     * gesture settles rather than once per frame.
     *
     * A column the user has resized themselves is left alone and treated as fixed width — a header drag, a
     * keyboard resize or a double-click auto-size — as is one given an explicit width through
     * `applyColumnState`. `colDef.width` is only a starting width and stays eligible; to hold a column at a
     * fixed width, set `suppressAutoSize` or `suppressSizeToFit` on it.
     * @default false
     */
    continuous?: boolean;
    /**
     * Called before each continuous re-size, with the columns eligible to be re-sized and the reason the
     * grid wants to re-size them. Return `false` to skip this one. Requires `continuous`.
     */
    shouldAutoSizeColumns?: (params: AutoSizeColumnsTriggerParams<TData, TContext>) => boolean;
}

/**
 * Auto-size columns to fit their cell contents.
 *
 * Not supported by the Viewport Row Model
 */
export interface SizeColumnsToContentStrategy<TData = any, TContext = any>
    extends ISizeAllColumnsToContentParams, ContinuousAutoSizeOptions<TData, TContext> {
    type: 'fitCellContents';
    /**
     * If `true`, the Column Menu and Context Menu auto-size actions reuse this strategy's options.
     * @default false
     */
    applyToUiActions?: boolean;
}

export interface ISizeAllColumnsToContentParams extends DefaultWidthLimits {
    /** If true, the header won't be included when calculating the column widths. */
    skipHeader?: boolean;
    /** If not provided will auto-size all columns. Otherwise will size the specified columns. */
    colIds?: string[];
    /** Provide to limit specific column widths when sizing. */
    columnLimits?: SizeColumnsToContentColumnLimits[];
    /** Proportionally scale up columns after sizing to fill any empty space remaining in the grid. */
    scaleUpToFitGridWidth?: boolean;
}

export interface ISizeColumnsToContentParams extends ISizeAllColumnsToContentParams {
    /** If not provided will auto-size all columns. Otherwise will size the specified columns. */
    colIds?: string[];
}

export type AutoSizeStrategy<TData = any, TContext = any> =
    | SizeColumnsToFitGridStrategy<TData, TContext>
    | SizeColumnsToFitProvidedWidthStrategy<TData, TContext>
    | SizeColumnsToContentStrategy<TData, TContext>;
