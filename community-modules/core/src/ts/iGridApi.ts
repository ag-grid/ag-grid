import { ColumnApi } from "./columns/columnApi";
import { IAggFunc } from "./entities/colDef";
import { Column } from "./entities/column";
import { RowNode, RowPinnedType } from "./entities/rowNode";
import { AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { ChartType, CrossFilterChartType, SeriesChartType } from "./interfaces/iChartOptions";
import { CellRangeParams } from "./interfaces/IRangeService";

export interface StartEditingCellParams {
    /** The row index of the row to start editing */
    rowIndex: number;
    /** The column key of the row to start editing */
    colKey: string | Column;
    /** Set to `'top'` or `'bottom'` to start editing a pinned row */
    rowPinned?: RowPinnedType;
    /** The key to pass to the cell editor */
    key?: string;
    /** The charPress to pass to the cell editor */
    charPress?: string;
}

export interface GetCellsParams<TData = any> {
    /** Optional list of row nodes to restrict operation to */
    rowNodes?: RowNode<TData>[];
    /** Optional list of columns to restrict operation to */
    columns?: (string | Column)[];
}

export interface RefreshCellsParams<TData = any> extends GetCellsParams<TData> {
    /** Skip change detection, refresh everything. */
    force?: boolean;
    /** Skip cell flashing, if cell flashing is enabled. */
    suppressFlash?: boolean;
}

export interface FlashCellsParams<TData = any> extends GetCellsParams<TData> {
    flashDelay?: number;
    fadeDelay?: number;
}

export interface GetCellRendererInstancesParams<TData = any> extends GetCellsParams<TData> { }

export interface GetCellEditorInstancesParams<TData = any> extends GetCellsParams<TData> { }

export interface RedrawRowsParams<TData = any> {
    /** Row nodes to redraw */
    rowNodes?: RowNode<TData>[];
}

interface CreateChartParams {
    /** The type of chart to create. */
    chartType: ChartType;
    /** The default theme to use, either a default option or your own custom theme. */
    chartThemeName?: string;
    /** Provide to display the chart outside of the grid in your own container. */
    chartContainer?: HTMLElement;
    /** Allows specific chart options in the current theme to be overridden. */
    chartThemeOverrides?: AgChartThemeOverrides;
    /** When enabled the chart will be unlinked from the grid after creation, any updates to the data will not be reflected in the chart. */
    unlinkChart?: boolean;
}

export type ChartParamsCellRange = Partial<Omit<CellRangeParams, 'rowStartPinned' | 'rowEndPinned'>>;
export interface CreateRangeChartParams extends CreateChartParams {
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
    /** The series chart type configurations used in combination charts */
    seriesChartTypes?: SeriesChartType[];
}
export interface CreateCrossFilterChartParams extends CreateChartParams {
    /** The type of cross-filter chart to create. */
    chartType: CrossFilterChartType;
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
}

export interface CreatePivotChartParams extends CreateChartParams { }

export interface DetailGridInfo {
    /**
     * Id of the detail grid, the format is `detail_<ROW_ID>`,
     * where ROW_ID is the `id` of the parent row.
     */
    id: string;
    /** Grid api of the detail grid. */
    api?: GridApi;
    /** Column api of the detail grid. */
    columnApi?: ColumnApi;
}

export interface ISizeColumnsToFitParams {
    /** Defines a default minimum width for every column (does not override the column minimum width) */
    defaultMinWidth?: number,
    /** Defines a default maximum width for every column (does not override the column maximum width) */
    defaultMaxWidth?: number,
    /** Provides a minimum and/or maximum width to specific columns */
    columnLimits?: IColumnLimit[]
}

export interface IColumnLimit {
    /** Selector for the column to which these dimension limits will apply */
    key: Column | string,
    /** Defines a minimum width for this column (does not override the column minimum width) */
    minWidth?: number,
    /** Defines a maximum width for this column (does not override the column maximum width) */
    maxWidth?: number
}