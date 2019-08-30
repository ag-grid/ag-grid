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

export interface FilterModifiedEvent extends AgGridEvent {
    filterInstance: IFilterComp;
    column: Column;
}

export interface FilterOpenedEvent extends AgGridEvent {
    column: Column;
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

export interface RowDragEvent extends AgGridEvent {
    node: RowNode;
    y: number;
    vDirection: string;
    event: MouseEvent;
    overIndex: number;
    overNode: RowNode;
}

export interface RowDragEnterEvent extends RowDragEvent {
}

export interface RowDragEndEvent extends RowDragEvent {
}

export interface RowDragMoveEvent extends RowDragEvent {
}

export interface RowDragLeaveEvent extends RowDragEvent {
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

export interface ItemsAddedEvent extends AgGridEvent {
    items: RowNode[];
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
export interface CellFocusedEvent extends AgGridEvent {
    rowIndex: number;
    column: Column;
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

export interface ColumnEvent extends AgGridEvent {
    column: Column | null;
    columns: Column[] | null;
    source: ColumnEventType;
}

export interface ColumnResizedEvent extends ColumnEvent {
    finished: boolean;
}

export interface ColumnPivotChangedEvent extends ColumnEvent {
}

export interface ColumnRowGroupChangedEvent extends ColumnEvent {
}

export interface ColumnValueChangedEvent extends ColumnEvent {
}

export interface ColumnMovedEvent extends ColumnEvent {
    toIndex: number | undefined;
}

export interface ColumnVisibleEvent extends ColumnEvent {
    visible: boolean | undefined;
}

export interface ColumnPinnedEvent extends ColumnEvent {
    pinned: string | null;
}

/**------------*/

/** ROW EVENTS */
/**------------*/
export interface RowEvent extends AgGridEvent {
    node: RowNode;
    data: any;
    rowIndex: number;
    rowPinned: string;
    context: any;
    event?: Event | null;
}

export interface RowGroupOpenedEvent extends RowEvent {
}

export interface RowValueChangedEvent extends RowEvent {
}

export interface RowSelectedEvent extends RowEvent {
}

export interface VirtualRowRemovedEvent extends RowEvent {
}

export interface RowClickedEvent extends RowEvent {
}

export interface RowDoubleClickedEvent extends RowEvent {
}

export interface RowEditingStartedEvent extends RowEvent {
}

export interface RowEditingStoppedEvent extends RowEvent {
}

/**------------*/

/** CELL EVENTS */
/**------------*/
export interface CellEvent extends RowEvent {
    column: Column;
    colDef: ColDef;
    value: any;
}

export interface CellKeyDownEvent extends CellEvent {
}

export interface CellKeyPressEvent extends CellEvent {
}

export interface CellClickedEvent extends CellEvent {
}

export interface CellMouseDownEvent extends CellEvent {
}

export interface CellDoubleClickedEvent extends CellEvent {
}

export interface CellMouseOverEvent extends CellEvent {
}

export interface CellMouseOutEvent extends CellEvent {
}

export interface CellContextMenuEvent extends CellEvent {
}

export interface CellEditingStartedEvent extends CellEvent {
}

export interface CellEditingStoppedEvent extends CellEvent {
}

export interface CellValueChangedEvent extends CellEvent {
    oldValue: any;
    newValue: any;
}

// not documented, was put in for CS - more thought needed of how server side grouping / pivoting
// is done and how these should be used before we fully document and share with the world.
export interface ColumnRequestEvent extends AgGridEvent {
    columns: Column[];
}

export interface ColumnRowGroupChangeRequestEvent extends ColumnRequestEvent {
}

export interface ColumnPivotChangeRequestEvent extends ColumnRequestEvent {
}

export interface ColumnValueChangeRequestEvent extends ColumnRequestEvent {
}

export interface ColumnAggFuncChangeRequestEvent extends ColumnRequestEvent {
    aggFunc: any;
}

// not documented, for internal use only
export interface ScrollVisibilityChangedEvent extends AgGridEvent {
}