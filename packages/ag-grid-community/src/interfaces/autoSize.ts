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
export interface SizeColumnsToFitGridStrategy extends DefaultWidthLimits {
    type: 'fitGridWidth';
    /** Provide to limit specific column widths when sizing. */
    columnLimits?: SizeColumnsToFitGridColumnLimits[];
}

/** Auto-size columns to fit a provided width. */
export interface SizeColumnsToFitProvidedWidthStrategy {
    type: 'fitProvidedWidth';
    width: number;
}

export interface SizeColumnsToContentColumnLimits extends WidthLimits {
    colId: string;
}

/** Params for the `shouldAutoSizeColumns` callback of the continuous `fitCellContents` strategy. */
export interface AutoSizeColumnsTriggerParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** What changed in the grid to make it want to re-size columns. */
    reason: 'dataChanged' | 'columnsChanged' | 'viewportChanged' | 'gridSizeChanged';
    /**
     * All eligible columns — those not owned by the developer or user, and not otherwise excluded.
     * The grid may only be able to measure the subset of these that is currently rendered.
     */
    columns: Column[];
}

/**
 * Auto-size columns to fit their cell contents.
 *
 * Not supported by the Viewport Row Model
 */
export interface SizeColumnsToContentStrategy extends ISizeAllColumnsToContentParams {
    type: 'fitCellContents';
    /**
     * If `true`, columns are re-sized to fit their cell contents whenever the data, the displayed columns,
     * the viewport or the grid size changes — not only after the first data render.
     *
     * Columns whose width is owned by the developer or the user are left alone: an explicit `colDef.width`,
     * a header drag resize, a double-click auto-size, or `applyColumnState` with an explicit `width`.
     * Use `colDef.initialWidth` instead of `colDef.width` to seed a width that stays eligible for re-sizing.
     *
     * Only currently rendered cells can be measured, so scrolling may progressively size columns as more
     * content is rendered. Flex columns are excluded.
     * @default false
     */
    continuous?: boolean;
    /**
     * Called before each continuous auto-size, with the columns eligible to be re-sized and the reason the
     * grid wants to re-size them. Return `false` to skip this one; the columns are neither measured nor
     * resized. Has no effect unless `continuous` is `true`.
     */
    shouldAutoSizeColumns?: (params: AutoSizeColumnsTriggerParams) => boolean;
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

export type AutoSizeStrategy =
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy;
