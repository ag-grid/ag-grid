import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
import { ColDef } from "./entities/colDef";
import { GridApi } from "./gridApi";
import { ColumnApi } from "./columnController/columnApi";
import { OriginalColumnGroup } from "./entities/originalColumnGroup";
import { FilterRequestSource } from "./filter/filterManager";
import {ChartOptions, ChartType} from "./interfaces/iChartOptions";
import {IFilterComp} from "./interfaces/iFilter";

export { Events } from './eventKeys';

export interface ModelUpdatedEvent extends AgGridEvent {
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
}

export interface AgEvent {
    type: string;
}

export interface AgGridEvent extends AgEvent {
    api: GridApi;
    columnApi: ColumnApi;
}

export interface ToolPanelVisibleChangedEvent extends AgGridEvent {
    source: string | undefined;
}

export interface AnimationQueueEmptyEvent extends AgGridEvent {
}

export interface ColumnPivotModeChangedEvent extends AgGridEvent {
}

export interface VirtualColumnsChangedEvent extends AgGridEvent {
}

export interface ColumnEverythingChangedEvent extends AgGridEvent {
    source: string;
}

export interface NewColumnsLoadedEvent extends AgGridEvent {
}

export interface GridColumnsChangedEvent extends AgGridEvent {
}

export interface DisplayedColumnsChangedEvent extends AgGridEvent {
}

export interface RowDataChangedEvent extends AgGridEvent {
}

export interface RowDataUpdatedEvent extends AgGridEvent {
}

export interface PinnedRowDataChangedEvent extends AgGridEvent {
}

export interface SelectionChangedEvent extends AgGridEvent {
}

export interface FilterChangedEvent extends AgGridEvent {
}

export interface FilterModifiedEvent<T> extends AgGridEvent {
    filterInstance: IFilterComp;
    column: Column<T>;
}

export interface FilterOpenedEvent<T> extends AgGridEvent {
    column: Column<T>;
    source: FilterRequestSource;
    eGui: HTMLElement;
}

export interface SortChangedEvent extends AgGridEvent {
}

export interface GridReadyEvent extends AgGridEvent {
}

export interface DisplayedColumnsWidthChangedEvent extends AgGridEvent {
} // not documented
export interface ColumnHoverChangedEvent extends AgGridEvent {
} // not documented
export interface BodyHeightChangedEvent extends AgGridEvent {
} // not documented

// this event is 'odd one out' as it should have properties for all the properties
// in gridOptions that can be bound by the framework. for example, the gridOptions
// has 'rowData', so this property should have 'rowData' also, so that when the row
// data changes via the framework bound property, this event has that attribute set.
export interface ComponentStateChangedEvent extends AgGridEvent {
}

export interface DragEvent extends AgGridEvent {
    type: string;
}

export interface DragStartedEvent extends DragEvent {
}

export interface DragStoppedEvent extends DragEvent {
}

export interface GridSizeChangedEvent extends AgGridEvent {
    clientWidth: number;
    clientHeight: number;
}

export interface RowDragEvent<T> extends AgGridEvent {
    node: RowNode<T>;
    y: number;
    vDirection: string;
    event: MouseEvent;
    overIndex: number;
    overNode: RowNode<T>;
}

export interface RowDragEnterEvent<T> extends RowDragEvent<T>  {
}

export interface RowDragEndEvent<T> extends RowDragEvent<T>  {
}

export interface RowDragMoveEvent<T> extends RowDragEvent<T>  {
}

export interface RowDragLeaveEvent<T> extends RowDragEvent<T>  {
}

export interface PasteStartEvent extends AgGridEvent {
    source: string;
}

export interface PasteEndEvent extends AgGridEvent {
    source: string;
}

export interface ViewportChangedEvent extends AgGridEvent {
    firstRow: number;
    lastRow: number;
}

export interface FirstDataRenderedEvent extends AgGridEvent {
    firstRow: number;
    lastRow: number;
}

export interface RangeSelectionChangedEvent extends AgGridEvent {
    finished: boolean;
    started: boolean;
}

export interface ChartRangeSelectionChanged extends AgGridEvent {
}

export interface ChartOptionsChanged extends AgEvent {
    chartType: ChartType;
    chartOptions: ChartOptions;
}

export interface ColumnGroupOpenedEvent extends AgGridEvent {
    columnGroup: OriginalColumnGroup;
}

export interface ItemsAddedEvent<T> extends AgGridEvent {
    items: RowNode<T>[];
}

export interface BodyScrollEvent extends AgGridEvent {
    direction: string;
    left: number;
    top: number;
}

// not documented
export interface FlashCellsEvent extends AgGridEvent {
    cells: any;
}

export interface PaginationChangedEvent extends AgGridEvent {
    animate?: boolean;
    keepRenderedRows?: boolean;
    newData?: boolean;
    newPage: boolean;
}

// this does not extent CellEvent as the focus service doesn't keep a reference to
// the rowNode.
export interface CellFocusedEvent<T> extends AgGridEvent {
    rowIndex: number;
    column: Column<T>;
    rowPinned: string;
    forceBrowserFocus: boolean;
    // floating is for backwards compatibility, this is the same as rowPinned.
    // this is because the focus service doesn't keep references to rowNodes
    // as focused cell is identified by rowIndex - thus when the user re-orders
    // or filters, the focused cell stays with the index, but the node can change.
    floating: string;
}

export interface ExpandCollapseAllEvent extends AgGridEvent {
    source: string;
}

/**---------------*/
/** COLUMN EVENTS */
/**---------------*/

export type ColumnEventType =
    "sizeColumnsToFit" |
    "autosizeColumns" |
    "alignedGridChanged" |
    "filterChanged" |
    "filterDestroyed" |
    "gridOptionsChanged" |
    "gridInitializing" |
    "toolPanelDragAndDrop" |
    "toolPanelUi" |
    "uiColumnMoved" |
    "uiColumnResized" |
    "uiColumnDragged" |
    "uiColumnExpanded" |
    "uiColumnSorted" |
    "contextMenu" |
    "columnMenu" |
    "rowModelUpdated" |
    "api" |
    "pivotChart";

export interface ColumnEvent<T> extends AgGridEvent {
    column: Column<T> | null;
    columns: Column<T>[] | null;
    source: ColumnEventType;
}

export interface ColumnResizedEvent<T> extends ColumnEvent<T> {
    finished: boolean;
}

export interface ColumnPivotChangedEvent<T> extends ColumnEvent<T> {
}

export interface ColumnRowGroupChangedEvent<T> extends ColumnEvent<T> {
}

export interface ColumnValueChangedEvent<T> extends ColumnEvent<T> {
}

export interface ColumnMovedEvent<T> extends ColumnEvent<T> {
    toIndex: number | undefined;
}

export interface ColumnVisibleEvent<T> extends ColumnEvent<T> {
    visible: boolean | undefined;
}

export interface ColumnPinnedEvent<T> extends ColumnEvent<T> {
    pinned: string | null;
}

/**------------*/

/** ROW EVENTS */
/**------------*/
export interface RowEvent<T> extends AgGridEvent {
    node: RowNode<T>;
    data: any;
    rowIndex: number;
    rowPinned: string;
    context: any;
    event?: Event | null;
}

export interface RowGroupOpenedEvent<T> extends RowEvent<T> {
}

export interface RowValueChangedEvent<T> extends RowEvent<T> {
}

export interface RowSelectedEvent<T> extends RowEvent<T> {
}

export interface VirtualRowRemovedEvent<T> extends RowEvent<T> {
}

export interface RowClickedEvent<T> extends RowEvent<T> {
}

export interface RowDoubleClickedEvent<T> extends RowEvent<T> {
}

export interface RowEditingStartedEvent<T> extends RowEvent<T> {
}

export interface RowEditingStoppedEvent<T> extends RowEvent<T> {
}

/**------------*/

/** CELL EVENTS */
/**------------*/
export interface CellEvent<T> extends RowEvent<T> {
    column: Column<T>;
    colDef: ColDef<T>;
    value: any;
}

export interface CellKeyDownEvent<T> extends CellEvent<T> {
}

export interface CellKeyPressEvent<T> extends CellEvent<T> {
}

export interface CellClickedEvent<T> extends CellEvent<T> {
}

export interface CellMouseDownEvent<T> extends CellEvent<T> {
}

export interface CellDoubleClickedEvent<T> extends CellEvent<T> {
}

export interface CellMouseOverEvent<T> extends CellEvent<T> {
}

export interface CellMouseOutEvent<T> extends CellEvent<T> {
}

export interface CellContextMenuEvent<T> extends CellEvent<T> {
}

export interface CellEditingStartedEvent<T> extends CellEvent<T> {
}

export interface CellEditingStoppedEvent<T> extends CellEvent<T> {
}

export interface CellValueChangedEvent<T> extends CellEvent<T> {
    oldValue: any;
    newValue: any;
}

// not documented, was put in for CS - more thought needed of how server side grouping / pivoting
// is done and how these should be used before we fully document and share with the world.
export interface ColumnRequestEvent<T> extends AgGridEvent {
    columns: Column<T>[];
}

export interface ColumnRowGroupChangeRequestEvent<T> extends ColumnRequestEvent<T>  {
}

export interface ColumnPivotChangeRequestEvent<T> extends ColumnRequestEvent<T>  {
}

export interface ColumnValueChangeRequestEvent<T> extends ColumnRequestEvent<T>  {
}

export interface ColumnAggFuncChangeRequestEvent<T> extends ColumnRequestEvent<T>  {
    aggFunc: any;
}

// not documented, for internal use only
export interface ScrollVisibilityChangedEvent extends AgGridEvent {
}