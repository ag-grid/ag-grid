import { Column, ColumnPinnedType } from './entities/column';
import { ColDef } from './entities/colDef';
import { ProvidedColumnGroup } from './entities/providedColumnGroup';
import { FilterRequestSource } from './filter/filterManager';
import { ChartType } from './interfaces/iChartOptions';
import { IFilterComp } from './interfaces/iFilter';
import { CellRange, CellRangeParams } from './interfaces/IRangeService';
import { ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { AgChartThemeOverrides } from './interfaces/iAgChartOptions';
import { AgGridCommon } from './interfaces/iCommon';
import { RowPinnedType, IRowNode } from './interfaces/iRowNode';
export { Events } from './eventKeys';
export interface ModelUpdatedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
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
export interface PaginationChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
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
export interface AgGridEvent<TData = any, TContext = any> extends AgGridCommon<TData, TContext>, AgEvent {
}
export interface ToolPanelVisibleChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: string | undefined;
}
/**
 * This is the replacement event for ToolPanelVisibleChangedEvent. In v30, this will be renamed ToolPanelVisibleChangedEvent,
 * and the original ToolPanelVisibleChangedEvent will be dropped
 */
export interface InternalToolPanelVisibleChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api';
    /** Key of tool panel. */
    key: string;
    /** True if now visible; false if now hidden. */
    visible: boolean;
}
export interface ToolPanelSizeChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    type: 'toolPanelSizeChanged';
    /** True if this is the first change to the Tool Panel size. */
    started: boolean;
    /** True if this is the last change to the Tool Panel size. */
    ended: boolean;
    /** New width of the ToolPanel component. */
    width: number;
}
export interface ColumnPivotModeChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface VirtualColumnsChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface ColumnEverythingChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: string;
}
export interface NewColumnsLoadedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface GridColumnsChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface DisplayedColumnsChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
/** @deprecated v28 use RowDataUpdatedEvent instead */
export interface RowDataChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface RowDataUpdatedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface PinnedRowDataChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
/**
 * - `api` - from API method
 * - `apiSelectAll` - from API methods `selectAll`/`deselectAll`
 * - `apiSelectAllFiltered` - from API methods `selectAllFiltered`/`deselectAllFiltered`
 * - `apiSelectAllCurrentPage` - from API methods `selectAllOnCurrentPage`/`deselectAllOnCurrentPage`
 * - `checkboxSelected` - row selection checkbox clicked
 * - `rowClicked` - row clicked when row selection enabled
 * - `rowDataChanged` - row data updated which triggered selection updates
 * - `rowGroupChanged` - grouping changed which updated the selection
 * - `selectableChanged`- selectable status of row has changed when `groupSelectsChildren = true`
 * - `spacePressed` - space key pressed on row
 * - `uiSelectAll` - select all in header clicked
 * - `uiSelectAllFiltered` - select all in header clicked when `headerCheckboxSelectionFilteredOnly = true`
 * - `uiSelectAllCurrentPage` - select all in header clicked when `headerCheckboxSelectionCurrentPageOnly = true`
 */
export declare type SelectionEventSourceType = 'api' | 'apiSelectAll' | 'apiSelectAllFiltered' | 'apiSelectAllCurrentPage' | 'checkboxSelected' | 'rowClicked' | 'rowDataChanged' | 'rowGroupChanged' | 'selectableChanged' | 'spacePressed' | 'uiSelectAll' | 'uiSelectAllFiltered' | 'uiSelectAllCurrentPage';
export interface SelectionChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: SelectionEventSourceType;
}
export interface FilterChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
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
export interface FilterModifiedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    filterInstance: IFilterComp;
    column: Column;
}
export interface FilterOpenedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Column / OriginalColumnGroup that contains the filter */
    column: Column | ProvidedColumnGroup;
    /** Source of the open request */
    source: FilterRequestSource;
    /** Parent element of the filter */
    eGui: HTMLElement;
}
export interface FilterDestroyedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: 'api' | 'columnChanged' | 'gridDestroyed';
    column: Column;
}
export interface SortChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Source of the sort change. */
    source: string;
}
export interface GridReadyEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface DisplayedColumnsWidthChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface ColumnHoverChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface BodyHeightChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface ComponentStateChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface ColumnPanelItemDragStartEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    column: Column | ProvidedColumnGroup;
}
export interface ColumnPanelItemDragEndEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface AgDragEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** The DOM element that started the event. */
    target: HTMLElement;
}
export interface DragStartedEvent<TData = any, TContext = any> extends AgDragEvent<TData, TContext> {
    type: 'dragStarted';
}
export interface DragStoppedEvent<TData = any, TContext = any> extends AgDragEvent<TData, TContext> {
    type: 'dragStopped';
}
export interface CheckboxChangedEvent extends AgEvent {
    id: string;
    name: string;
    selected?: boolean;
    previousValue: boolean | undefined;
}
export interface GridSizeChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** The grid's DIV's clientWidth */
    clientWidth: number;
    /** The grid's DIV's clientHeight */
    clientHeight: number;
}
export interface RowDragEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Event identifier: One of rowDragEnter, rowDragMove, rowDragEnd, rowDragLeave */
    type: string;
    /** The row node getting dragged. Also the node that started the drag when multi-row dragging. */
    node: IRowNode<TData>;
    /** The list of nodes being dragged. */
    nodes: IRowNode<TData>[];
    /** The underlying mouse move event associated with the drag. */
    event: MouseEvent;
    /** The `eventPath` persists the `event.composedPath()` result for access within AG Grid event handlers.  */
    eventPath?: EventTarget[];
    /** Direction of the drag, either `'up'`, `'down'` or `null` (if mouse is moving horizontally and not vertically). */
    vDirection: string;
    /** The row index the mouse is dragging over or -1 if over no row. */
    overIndex: number;
    /** The row node the mouse is dragging over or undefined if over no row. */
    overNode?: IRowNode<TData>;
    /** The vertical pixel location the mouse is over, with `0` meaning the top of the first row.
     * This can be compared to the `rowNode.rowHeight` and `rowNode.rowTop` to work out the mouse position relative to rows.
     * The provided attributes `overIndex` and `overNode` means the `y` property is mostly redundant.
     * The `y` property can be handy if you want more information such as 'how close is the mouse to the top or bottom of the row?'
     */
    y: number;
}
export interface RowDragEnterEvent<TData = any, TContext = any> extends RowDragEvent<TData, TContext> {
}
export interface RowDragEndEvent<TData = any, TContext = any> extends RowDragEvent<TData, TContext> {
}
export interface RowDragMoveEvent<TData = any, TContext = any> extends RowDragEvent<TData, TContext> {
}
export interface RowDragLeaveEvent<TData = any, TContext = any> extends RowDragEvent<TData, TContext> {
}
export interface PasteStartEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: string;
}
export interface PasteEndEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: string;
}
export interface FillStartEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface FillEndEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    initialRange: CellRange;
    finalRange: CellRange;
}
export interface UndoStartedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
}
export interface UndoEndedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
    /** `true` if any undo operations were performed. */
    operationPerformed: boolean;
}
export interface RedoStartedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
}
export interface RedoEndedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Source of the event. `api` if via API method. `ui` if via keyboard shortcut. */
    source: 'api' | 'ui';
    /** `true` if any redo operations were performed. */
    operationPerformed: boolean;
}
export interface ViewportChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Index of the first rendered row */
    firstRow: number;
    /** Index of the last rendered row */
    lastRow: number;
}
export interface FirstDataRenderedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Index of the first rendered row */
    firstRow: number;
    /** Index of the last rendered row */
    lastRow: number;
}
export interface RangeSelectionChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    id?: string;
    /** True for the first change event, otherwise false */
    started: boolean;
    /** True for the last change event, otherwise false */
    finished: boolean;
}
export interface ChartCreated<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Will always be `chartCreated`. */
    type: string;
    /** Id of the created chart. This can later be used to reference the chart via api methods. */
    chartId: string;
}
export interface ChartRangeSelectionChanged<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Will always be `chartRangeSelectionChanged`. */
    type: string;
    /** Id of the effected chart. */
    chartId: string;
    /** Same as `chartId`. */
    id: string;
    /** New cellRange selected. */
    cellRange: CellRangeParams;
}
export interface ChartOptionsChanged<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
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
export interface ChartDestroyed<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** Will always be `chartDestroyed`. */
    type: string;
    /** Id of the effected chart. */
    chartId: string;
}
export interface ColumnGroupOpenedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    columnGroup: ProvidedColumnGroup;
}
export interface ItemsAddedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    items: IRowNode<TData>[];
}
export declare type ScrollDirection = 'horizontal' | 'vertical';
export interface BodyScrollEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    direction: ScrollDirection;
    left: number;
    top: number;
}
export interface BodyScrollEndEvent<TData = any, TContext = any> extends BodyScrollEvent<TData, TContext> {
}
export interface FlashCellsEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    cells: any;
}
export interface PaginationPixelOffsetChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface CommonCellFocusParams {
    /** Row index of the focused cell */
    rowIndex: number | null;
    /** Column of the focused cell */
    column: Column | string | null;
    /** either 'top', 'bottom' or null / undefined (if not pinned) */
    rowPinned: RowPinnedType;
    /** Whether the cell a full width cell or a regular cell */
    isFullWidthCell?: boolean;
}
export interface CellFocusClearedParams extends CommonCellFocusParams {
}
export interface CellFocusedParams extends CommonCellFocusParams {
    /** Whether browser focus is also set (false when editing) */
    forceBrowserFocus?: boolean;
    /** When `forceBrowserFocus` is `true`, should scroll be prevented */
    preventScrollOnBrowserFocus?: boolean;
    floating?: string | null;
}
export interface CellFocusClearedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext>, CellFocusClearedParams {
}
export interface CellFocusedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext>, CellFocusedParams {
}
export interface FullWidthRowFocusedEvent<TData = any> extends CellFocusedEvent<TData> {
    fromBelow: boolean;
}
export interface ExpandCollapseAllEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    source: string;
}
/**---------------*/
/** COLUMN EVENTS */
/**---------------*/
export declare type ColumnEventType = "sizeColumnsToFit" | "autosizeColumns" | "autosizeColumnHeaderHeight" | "alignedGridChanged" | "filterChanged" | "filterDestroyed" | "gridOptionsChanged" | "gridInitializing" | "toolPanelDragAndDrop" | "toolPanelUi" | "uiColumnMoved" | "uiColumnResized" | "uiColumnDragged" | "uiColumnExpanded" | "uiColumnSorted" | "contextMenu" | "columnMenu" | "rowModelUpdated" | "rowDataUpdated" | "api" | "flex" | "pivotChart" | "columnRowGroupChanged";
export interface ColumnEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /** The impacted column, only set if action was on one column */
    column: Column | null;
    /** List of all impacted columns */
    columns: Column[] | null;
    /** String describing where the event is coming from */
    source: ColumnEventType;
}
export interface ColumnResizedEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
    /** Set to true for last event in a sequence of move events */
    finished: boolean;
    /** Any columns resized due to flex */
    flexColumns: Column[] | null;
}
export interface ColumnPivotChangedEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
}
export interface ColumnRowGroupChangedEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
}
export interface ColumnValueChangedEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
}
export interface ColumnMovedEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
    /** The position the column was moved to */
    toIndex?: number;
    /** `True` when the column has finished moving. */
    finished: boolean;
}
export interface ColumnVisibleEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
    /** True if column was set to visible, false if set to hide */
    visible?: boolean;
}
export interface ColumnPinnedEvent<TData = any, TContext = any> extends ColumnEvent<TData, TContext> {
    /** Either 'left', 'right', or null (it not pinned) */
    pinned: ColumnPinnedType;
}
/**------------*/
/** ROW EVENTS */
/**------------*/
interface BaseRowEvent<TData, TContext> extends AgGridEvent<TData, TContext> {
    /** The row node. */
    node: IRowNode<TData>;
    /** The visible row index for the row */
    rowIndex: number | null;
    /** Either 'top', 'bottom' or null / undefined (if not set) */
    rowPinned: RowPinnedType;
    /** If event was due to browser event (eg click), this is the browser event */
    event?: Event | null;
    /** If the browser `event` is present the `eventPath` persists the `event.composedPath()` result for access within AG Grid event handlers.  */
    eventPath?: EventTarget[];
}
export interface RowEvent<TData = any, TContext = any> extends BaseRowEvent<TData, TContext> {
    /** The user provided data for the row. Data is `undefined` for row groups. */
    data: TData | undefined;
}
/** Base interface for row events that always have data set. */
interface RowWithDataEvent<TData = any, TContext = any> extends BaseRowEvent<TData, TContext> {
    /** The user provided data for the row. */
    data: TData;
}
export interface RowGroupOpenedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
    /** True if the group is expanded. */
    expanded: boolean;
}
export interface RowValueChangedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface RowSelectedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
    source: SelectionEventSourceType;
}
export interface VirtualRowRemovedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface RowClickedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface RowDoubleClickedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface RowEditingStartedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface RowEditingStoppedEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface FullWidthCellKeyDownEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
}
export interface FullWidthCellKeyPressEvent<TData = any, TContext = any> extends RowEvent<TData, TContext> {
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
export interface AsyncTransactionsFlushed<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    /**
     * Array of result objects. for SSRM it's always list of `ServerSideTransactionResult`.
     * For Client-Side Row Model it's a list of `RowNodeTransaction`.
     */
    results: (RowNodeTransaction<TData> | ServerSideTransactionResult)[];
}
export interface ColumnRequestEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
    columns: Column[];
}
export interface ColumnRowGroupChangeRequestEvent<TData = any, TContext = any> extends ColumnRequestEvent<TData, TContext> {
}
export interface ColumnPivotChangeRequestEvent<TData = any, TContext = any> extends ColumnRequestEvent<TData, TContext> {
}
export interface ColumnValueChangeRequestEvent<TData = any, TContext = any> extends ColumnRequestEvent<TData, TContext> {
}
export interface ColumnAggFuncChangeRequestEvent<TData = any, TContext = any> extends ColumnRequestEvent<TData, TContext> {
    aggFunc: any;
}
export interface ScrollVisibilityChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface StoreUpdatedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface LeftPinnedWidthChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface RightPinnedWidthChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface RowContainerHeightChanged<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface DisplayedRowsChangedEvent<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
export interface CssVariablesChanged<TData = any, TContext = any> extends AgGridEvent<TData, TContext> {
}
