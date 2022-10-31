import { RowNode, RowPinnedType } from './entities/rowNode';
import { Column, ColumnPinnedType } from './entities/column';
import { ColDef } from './entities/colDef';
import { ProvidedColumnGroup } from './entities/providedColumnGroup';
import { FilterRequestSource } from './filter/filterManager';
import { ChartType } from './interfaces/iChartOptions';
import { IFilterComp } from './interfaces/iFilter';
import { CellRange, CellRangeParams } from './interfaces/IRangeService';
import { ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { AgGridCommon } from './interfaces/iCommon';
export { Events } from './eventKeys';
export interface ModelUpdatedEvent<TData = any> extends AgGridEvent<TData> {
    /** If true, the grid will try and animate the rows to the new positions */
    animate: boolean | undefined;
    /** If true, the grid has new data loaded, eg user called setRowData(), otherwise
     * it's the same data but sorted or filtered, in which case this is true, and rows
     * can animate around (eg rowNode id 24 is the same row node as last time). */
    keepRenderedRows: boolean | undefined;
    /** If true, then this update was a result of setRowData() getting called. This
     * gets the grid to scroll to the top again. */
    newData: boolean | undefined;
    /** True when pagination and a new page is navigated to. */
    newPage: boolean;
    /** true if all we did is changed row height, data still the same, no need to clear the undo/redo stacks */
    keepUndoRedoStack?: boolean;
}
export interface PaginationChangedEvent<TData = any> extends AgGridEvent<TData> {
    /** True if rows were animated to new position */
    animate?: boolean;
    /** True if rows were kept (otherwise complete redraw) */
    keepRenderedRows?: boolean;
    /** True if data was new (i.e user set new data) */
    newData?: boolean;
    /** True if user went to a new page */
    newPage: boolean;
}
export interface AgEvent {
    /** Event identifier */
    type: string;
}
export interface AgGridEvent<TData = any> extends AgGridCommon<TData>, AgEvent {
}
export interface ToolPanelVisibleChangedEvent<TData = any> extends AgGridEvent<TData> {
    source: string | undefined;
}
export interface ToolPanelSizeChangedEvent<TData = any> extends AgGridEvent<TData> {
    type: 'toolPanelSizeChanged';
    /** True if this is the first change to the Tool Panel size. */
    started: boolean;
    /** True if this is the last change to the Tool Panel size. */
    ended: boolean;
    /** New width of the ToolPanel component. */
    width: number;
}
export interface ColumnPivotModeChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface VirtualColumnsChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface ColumnEverythingChangedEvent<TData = any> extends AgGridEvent<TData> {
    source: string;
}
export interface NewColumnsLoadedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface GridColumnsChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface DisplayedColumnsChangedEvent<TData = any> extends AgGridEvent<TData> {
}
/** @deprecated use RowDataUpdatedEvent instead */
export interface RowDataChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface RowDataUpdatedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface PinnedRowDataChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface SelectionChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface FilterChangedEvent<TData = any> extends AgGridEvent<TData> {
    /** True if the filter was changed as a result of data changing */
    afterDataChange?: boolean;
    /** True if filter was changed via floating filter */
    afterFloatingFilter?: boolean;
    /**
     * Columns affected by the filter change. Array contents depend on the source of the event.
     *
     * - Expect 1 element for UI-driven column filter changes.
     * - Expect 0-N elements (all affected columns) for calls to `gridOptions.api.setFilterModel()`.
     * - Expect 0-N elements (removed columns) for calls to `gridOptions.api.setColumnDefs()`.
     * - Expect 0 elements for quick-filters and calls to `gridOptions.api.onFilterChanged()`.
     */
    columns: Column[];
}
export interface FilterModifiedEvent<TData = any> extends AgGridEvent<TData> {
    filterInstance: IFilterComp;
    column: Column;
}
export interface FilterOpenedEvent<TData = any> extends AgGridEvent<TData> {
    /** Column / OriginalColumnGroup that contains the filter */
    column: Column | ProvidedColumnGroup;
    /** Source of the open request */
    source: FilterRequestSource;
    /** Parent element of the filter */
    eGui: HTMLElement;
}
export interface SortChangedEvent<TData = any> extends AgGridEvent<TData> {
    /** Source of the sort change. */
    source: string;
}
export interface GridReadyEvent<TData = any> extends AgGridEvent<TData> {
}
export interface DisplayedColumnsWidthChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface ColumnHoverChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface BodyHeightChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface ComponentStateChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface ColumnPanelItemDragStartEvent<TData = any> extends AgGridEvent<TData> {
    column: Column | ProvidedColumnGroup;
}
export interface ColumnPanelItemDragEndEvent<TData = any> extends AgGridEvent<TData> {
}
export interface DragEvent<TData = any> extends AgGridEvent<TData> {
    /** The DOM element that started the event. */
    target: HTMLElement;
}
export interface DragStartedEvent<TData = any> extends DragEvent<TData> {
    type: 'dragStarted';
}
export interface DragStoppedEvent<TData = any> extends DragEvent<TData> {
    type: 'dragStopped';
}
export interface CheckboxChangedEvent extends AgEvent {
    id: string;
    name: string;
    selected?: boolean;
    previousValue: boolean | undefined;
}
export interface GridSizeChangedEvent<TData = any> extends AgGridEvent<TData> {
    /** The grid's DIV's clientWidth */
    clientWidth: number;
    /** The grid's DIV's clientHeight */
    clientHeight: number;
}
export interface RowDragEvent<TData = any> extends AgGridEvent<TData> {
    /** Event identifier: One of rowDragEnter, rowDragMove, rowDragEnd, rowDragLeave */
    type: string;
    /** The row node getting dragged. Also the node that started the drag when multi-row dragging. */
    node: RowNode<TData>;
    /** The list of nodes being dragged. */
    nodes: RowNode<TData>[];
    /** The underlying mouse move event associated with the drag. */
    event: MouseEvent;
    /** Direction of the drag, either `'up'`, `'down'` or `null` (if mouse is moving horizontally and not vertically). */
    vDirection: string;
    /** The row index the mouse is dragging over or -1 if over no row. */
    overIndex: number;
    /** The row node the mouse is dragging over or undefined if over no row. */
    overNode?: RowNode<TData>;
    /** The vertical pixel location the mouse is over, with `0` meaning the top of the first row.
     * This can be compared to the `rowNode.rowHeight` and `rowNode.rowTop` to work out the mouse position relative to rows.
     * The provided attributes `overIndex` and `overNode` means the `y` property is mostly redundant.
     * The `y` property can be handy if you want more information such as 'how close is the mouse to the top or bottom of the row?'
     */
    y: number;
}
export interface RowDragEnterEvent<TData = any> extends RowDragEvent<TData> {
}
export interface RowDragEndEvent<TData = any> extends RowDragEvent<TData> {
}
export interface RowDragMoveEvent<TData = any> extends RowDragEvent<TData> {
}
export interface RowDragLeaveEvent<TData = any> extends RowDragEvent<TData> {
}
export interface PasteStartEvent<TData = any> extends AgGridEvent<TData> {
    source: string;
}
export interface PasteEndEvent<TData = any> extends AgGridEvent<TData> {
    source: string;
}
export interface FillStartEvent<TData = any> extends AgGridEvent<TData> {
}
export interface FillEndEvent<TData = any> extends AgGridEvent<TData> {
    initialRange: CellRange;
    finalRange: CellRange;
}
export interface ViewportChangedEvent<TData = any> extends AgGridEvent<TData> {
    /** Index of the first rendered row */
    firstRow: number;
    /** Index of the last rendered row */
    lastRow: number;
}
export interface FirstDataRenderedEvent<TData = any> extends AgGridEvent<TData> {
    /** Index of the first rendered row */
    firstRow: number;
    /** Index of the last rendered row */
    lastRow: number;
}
export interface RangeSelectionChangedEvent<TData = any> extends AgGridEvent<TData> {
    id?: string;
    /** True for the first change event, otherwise false */
    started: boolean;
    /** True for the last change event, otherwise false */
    finished: boolean;
}
export interface ChartCreated<TData = any> extends AgGridEvent<TData> {
    /** Will always be `chartCreated`. */
    type: string;
    /** Id of the created chart. This can later be used to reference the chart via api methods. */
    chartId: string;
}
export interface ChartRangeSelectionChanged<TData = any> extends AgGridEvent<TData> {
    /** Will always be `chartRangeSelectionChanged`. */
    type: string;
    /** Id of the effected chart. */
    chartId: string;
    /** Same as `chartId`. */
    id: string;
    /** New cellRange selected. */
    cellRange: CellRangeParams;
}
export interface ChartOptionsChanged<TData = any> extends AgGridEvent<TData> {
    /** Will always be `chartOptionsChanged`. */
    type: string;
    /** Id of the effected chart. */
    chartId: string;
    /** ChartType */
    chartType: ChartType;
    /** Chart theme name of currently selected theme. */
    chartThemeName: string;
    /** Chart options.  */
    chartOptions: AgChartThemeOverrides;
}
export interface ChartDestroyed<TData = any> extends AgGridEvent<TData> {
    /** Will always be `chartDestroyed`. */
    type: string;
    /** Id of the effected chart. */
    chartId: string;
}
export interface ColumnGroupOpenedEvent<TData = any> extends AgGridEvent<TData> {
    columnGroup: ProvidedColumnGroup;
}
export interface ItemsAddedEvent<TData = any> extends AgGridEvent<TData> {
    items: RowNode<TData>[];
}
export declare type ScrollDirection = 'horizontal' | 'vertical';
export interface BodyScrollEvent<TData = any> extends AgGridEvent<TData> {
    direction: ScrollDirection;
    left: number;
    top: number;
}
export interface BodyScrollEndEvent<TData = any> extends BodyScrollEvent<TData> {
}
export interface FlashCellsEvent<TData = any> extends AgGridEvent<TData> {
    cells: any;
}
export interface PaginationPixelOffsetChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface CellFocusedParams {
    /** Row index of the focused cell */
    rowIndex: number | null;
    /** Column of the focused cell */
    column: Column | string | null;
    /** either 'top', 'bottom' or null / undefined (if not pinned) */
    rowPinned: RowPinnedType;
    /** Whether the cell a full width cell or a regular cell */
    isFullWidthCell?: boolean;
    /** Whether browser focus is also set (false when editing) */
    forceBrowserFocus?: boolean;
    /** When `forceBrowserFocus` is `true`, should scroll be prevented */
    preventScrollOnBrowserFocus?: boolean;
    floating?: string | null;
}
export interface CellFocusedEvent<TData = any> extends AgGridEvent<TData>, CellFocusedParams {
}
export interface FullWidthRowFocusedEvent<TData = any> extends CellFocusedEvent<TData> {
    fromBelow: boolean;
}
export interface ExpandCollapseAllEvent<TData = any> extends AgGridEvent<TData> {
    source: string;
}
/**---------------*/
/** COLUMN EVENTS */
/**---------------*/
export declare type ColumnEventType = "sizeColumnsToFit" | "autosizeColumns" | "autosizeColumnHeaderHeight" | "alignedGridChanged" | "filterChanged" | "filterDestroyed" | "gridOptionsChanged" | "gridInitializing" | "toolPanelDragAndDrop" | "toolPanelUi" | "uiColumnMoved" | "uiColumnResized" | "uiColumnDragged" | "uiColumnExpanded" | "uiColumnSorted" | "contextMenu" | "columnMenu" | "rowModelUpdated" | "rowDataUpdated" | "api" | "flex" | "pivotChart";
export interface ColumnEvent<TData = any> extends AgGridEvent<TData> {
    /** The impacted column, only set if action was on one column */
    column: Column | null;
    /** List of all impacted columns */
    columns: Column[] | null;
    /** String describing where the event is coming from */
    source: ColumnEventType;
}
export interface ColumnResizedEvent<TData = any> extends ColumnEvent<TData> {
    /** Set to true for last event in a sequence of move events */
    finished: boolean;
    /** Any columns resized due to flex */
    flexColumns: Column[] | null;
}
export interface ColumnPivotChangedEvent<TData = any> extends ColumnEvent<TData> {
}
export interface ColumnRowGroupChangedEvent<TData = any> extends ColumnEvent<TData> {
}
export interface ColumnValueChangedEvent<TData = any> extends ColumnEvent<TData> {
}
export interface ColumnMovedEvent<TData = any> extends ColumnEvent<TData> {
    /** The position the column was moved to */
    toIndex?: number;
}
export interface ColumnVisibleEvent<TData = any> extends ColumnEvent<TData> {
    /** True if column was set to visible, false if set to hide */
    visible?: boolean;
}
export interface ColumnPinnedEvent<TData = any> extends ColumnEvent<TData> {
    /** Either 'left', 'right', or null (it not pinned) */
    pinned: ColumnPinnedType;
}
/**------------*/
/** ROW EVENTS */
/**------------*/
interface BaseRowEvent<TData> extends AgGridEvent<TData> {
    /** The row node. */
    node: RowNode<TData>;
    /** The visible row index for the row */
    rowIndex: number | null;
    /** Either 'top', 'bottom' or null / undefined (if not set) */
    rowPinned: RowPinnedType;
    /** If event was due to browser event (eg click), this is the browser event */
    event?: Event | null;
}
export interface RowEvent<TData = any> extends BaseRowEvent<TData> {
    /** The user provided data for the row. Data is `undefined` for row groups. */
    data: TData | undefined;
}
/** Base interface for row events that always have data set. */
interface RowWithDataEvent<TData = any> extends BaseRowEvent<TData> {
    /** The user provided data for the row. */
    data: TData;
}
export interface RowGroupOpenedEvent<TData = any> extends RowEvent<TData> {
    /** True if the group is expanded. */
    expanded: boolean;
}
export interface RowValueChangedEvent<TData = any> extends RowEvent<TData> {
}
export interface RowSelectedEvent<TData = any> extends RowEvent<TData> {
}
export interface VirtualRowRemovedEvent<TData = any> extends RowEvent<TData> {
}
export interface RowClickedEvent<TData = any> extends RowEvent<TData> {
}
export interface RowDoubleClickedEvent<TData = any> extends RowEvent<TData> {
}
export interface RowEditingStartedEvent<TData = any> extends RowEvent<TData> {
}
export interface RowEditingStoppedEvent<TData = any> extends RowEvent<TData> {
}
export interface FullWidthCellKeyDownEvent<TData = any> extends RowEvent<TData> {
}
export interface FullWidthCellKeyPressEvent<TData = any> extends RowEvent<TData> {
}
/**------------*/
/** CELL EVENTS */
/**------------*/
export interface CellEvent<TData = any, TValue = any> extends RowEvent<TData> {
    column: Column;
    colDef: ColDef<TData>;
    /** The value for the cell if available otherwise undefined. */
    value: TValue | undefined;
}
/** Use for cell events that will always have a value and data property. */
interface CellWithDataEvent<TData = any, TValue = any> extends RowWithDataEvent<TData> {
    column: Column;
    colDef: ColDef<TData>;
    /** The value for the cell */
    value: TValue;
}
export interface CellKeyDownEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellKeyPressEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellClickedEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellMouseDownEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellDoubleClickedEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellMouseOverEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellMouseOutEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellContextMenuEvent<TData = any, TValue = any> extends CellEvent<TData, TValue> {
}
export interface CellEditingStartedEvent<TData = any, TValue = any> extends CellWithDataEvent<TData, TValue> {
}
export interface CellEditingStoppedEvent<TData = any, TValue = any> extends CellWithDataEvent<TData, TValue> {
    /** The old value before editing */
    oldValue: any;
    /** The new value after editing */
    newValue: any;
    /** Property indicating if the value of the editor has changed */
    valueChanged: boolean;
}
export interface CellValueChangedEvent<TData = any, TValue = any> extends CellWithDataEvent<TData, TValue> {
    oldValue: any;
    newValue: any;
    source: string | undefined;
}
export interface CellEditRequestEvent<TData = any, TValue = any> extends CellWithDataEvent<TData, TValue> {
    oldValue: any;
    newValue: any;
    source: string | undefined;
}
export interface AsyncTransactionsFlushed<TData = any> extends AgGridEvent<TData> {
    /**
     * Array of result objects. for SSRM it's always list of `ServerSideTransactionResult`.
     * For Client-Side Row Model it's a list of `RowNodeTransaction`.
     */
    results: (RowNodeTransaction<TData> | ServerSideTransactionResult)[];
}
export interface ColumnRequestEvent<TData = any> extends AgGridEvent<TData> {
    columns: Column[];
}
export interface ColumnRowGroupChangeRequestEvent<TData = any> extends ColumnRequestEvent<TData> {
}
export interface ColumnPivotChangeRequestEvent<TData = any> extends ColumnRequestEvent<TData> {
}
export interface ColumnValueChangeRequestEvent<TData = any> extends ColumnRequestEvent<TData> {
}
export interface ColumnAggFuncChangeRequestEvent<TData = any> extends ColumnRequestEvent<TData> {
    aggFunc: any;
}
export interface ScrollVisibilityChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface StoreUpdatedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface LeftPinnedWidthChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface RightPinnedWidthChangedEvent<TData = any> extends AgGridEvent<TData> {
}
export interface RowContainerHeightChanged<TData = any> extends AgGridEvent<TData> {
}
export interface DisplayedRowsChangedEvent<TData = any> extends AgGridEvent<TData> {
}
