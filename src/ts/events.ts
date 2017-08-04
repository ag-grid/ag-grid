import {RowNode} from "./entities/rowNode";
import {Column} from "./entities/column";
import {ColDef} from "./entities/colDef";
import {GridApi} from "./gridApi";
import {ColumnApi} from "./columnController/columnController";
import {ColumnGroup} from "./entities/columnGroup";

export class Events {

    /** Everything has changed with the columns. Either complete new set of columns set, or user called setState()*/
    public static EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
    /** User has set in new columns. */
    public static EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded';

    /** The pivot mode flag was changed */
    public static EVENT_COLUMN_PIVOT_MODE_CHANGED = 'columnPivotModeChanged';
    
    /** A row group column was added, removed or order changed. */
    public static EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';

    /** A pivot column was added, removed or order changed. */
    public static EVENT_COLUMN_PIVOT_CHANGED = 'columnPivotChanged';

    /** The list of grid columns has changed. */
    public static EVENT_GRID_COLUMNS_CHANGED = 'gridColumnsChanged';

    /** A value column was added, removed or agg function was changed. */
    public static EVENT_COLUMN_VALUE_CHANGED = 'columnValueChanged';

    /** A column was moved */
    public static EVENT_COLUMN_MOVED = 'columnMoved';

    /** One or more columns was shown / hidden */
    public static EVENT_COLUMN_VISIBLE = 'columnVisible';

    /** One or more columns was pinned / unpinned*/
    public static EVENT_COLUMN_PINNED = 'columnPinned';

    /** A column group was opened / closed */
    public static EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';

    /** One or more columns was resized. If just one, the column in the event is set. */
    public static EVENT_COLUMN_RESIZED = 'columnResized';

    /** The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc */
    public static EVENT_DISPLAYED_COLUMNS_CHANGED = 'displayedColumnsChanged';

    /** The list of virtual columns has changed, results from viewport changing */
    public static EVENT_VIRTUAL_COLUMNS_CHANGED = 'virtualColumnsChanged';

    /** A row group was opened / closed */
    public static EVENT_ROW_GROUP_OPENED = 'rowGroupOpened';

    /** The client has set new data into the grid */
    public static EVENT_ROW_DATA_CHANGED = 'rowDataChanged';

    /** The client has set new data into the grid */
    public static EVENT_ROW_DATA_UPDATED = 'rowDataUpdated';

    /** The client has set new floating data into the grid */
    public static EVENT_PINNED_ROW_DATA_CHANGED = 'pinnedRowDataChanged';

    /** Range selection has changed */
    public static EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged';

    /** Model was updated - grid updates the drawn rows when this happens */
    public static EVENT_MODEL_UPDATED = 'modelUpdated';

    public static EVENT_CELL_CLICKED = 'cellClicked';
    public static EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
    public static EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
    public static EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
    public static EVENT_ROW_VALUE_CHANGED = 'rowValueChanged';
    public static EVENT_CELL_FOCUSED = 'cellFocused';
    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_SELECTION_CHANGED = 'selectionChanged';

    public static EVENT_CELL_MOUSE_OVER = 'cellMouseOver';
    public static EVENT_CELL_MOUSE_OUT = 'cellMouseOut';

    public static EVENT_COLUMN_HOVER_CHANGED = 'columnHoverChanged';

    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    public static EVENT_FILTER_CHANGED = 'filterChanged';

    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    public static EVENT_FILTER_MODIFIED = 'filterModified';

    public static EVENT_SORT_CHANGED = 'sortChanged';

    /** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
    public static EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';

    public static EVENT_ROW_CLICKED = 'rowClicked';
    public static EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';

    /** Gets called once after the grid has finished initialising. */
    public static EVENT_GRID_READY = 'gridReady';
    /** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
     * changed, so always filling the space it was given.  */
    public static EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
    /** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
    public static EVENT_VIEWPORT_CHANGED = 'viewportChanged';
    /** A column drag has started, either resizing a column or moving a column. */
    public static EVENT_DRAG_STARTED = 'dragStarted';
    /** A column drag has stopped */
    public static EVENT_DRAG_STOPPED = 'dragStopped';

    public static EVENT_ROW_EDITING_STARTED = 'rowEditingStarted';
    public static EVENT_ROW_EDITING_STOPPED = 'rowEditingStopped';

    public static EVENT_CELL_EDITING_STARTED = 'cellEditingStarted';
    public static EVENT_CELL_EDITING_STOPPED = 'cellEditingStopped';

    /** Main body of grid has scrolled, either horizontally or vertically */
    public static EVENT_BODY_SCROLL = 'bodyScroll';

    /** All items from here down are used internally by the grid, not intended for external use. */
    public static EVENT_FLASH_CELLS = 'flashCells';

    /** All the events from here down are experimental, should not be documented or used by ag-Grid customers */

    public static EVENT_PAGINATION_CHANGED = 'paginationChanged';

    public static EVENT_BODY_HEIGHT_CHANGED = 'bodyHeightChanged';

    // not documented, as it's experimental, don't want people with dependencies on this
    public static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED = 'displayedColumnsWidthChanged';
    public static EVENT_SCROLL_VISIBILITY_CHANGED = 'scrollVisibilityChanged';

    public static EVENT_COMPONENT_STATE_CHANGED = 'componentStateChanged';

    // these are used for server side group and agg - only used by CS with Viewport Row Model - intention is
    // to design these better around server side functions and then release to general public when fully working with
    // all the row models.
    public static EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST = 'columnRowGroupChangeRequest';
    public static EVENT_COLUMN_PIVOT_CHANGE_REQUEST = 'columnPivotChangeRequest';
    public static EVENT_COLUMN_VALUE_CHANGE_REQUEST = 'columnValueChangeRequest';
    public static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST = 'columnAggFuncChangeRequest';
}

export interface ModelUpdatedEvent extends AgEvent {
    /** If true, the grid will try and animate the rows to the new positions */
    animate: boolean;
    /** If true, the grid has new data loaded, eg user called setRowData(), otherwise
     * it's the same data but sorted or filtered, in which case this is true, and rows
     * can animate around (eg rowNode id 24 is the same row node as last time). */
    keepRenderedRows: boolean;
    /** If true, then this update was a result of setRowData() getting called. This
     * gets the grid to scroll to the top again. */
    newData: boolean;
    /** True when pagination and a new page is navigated to. */
    newPage: boolean;
}

export interface AgEvent {
    type: string;
}

export interface ColumnPivotModeChangedEvent extends AgEvent {}

export interface VirtualColumnsChangedEvent extends AgEvent {}

export interface ColumnEverythingChangedEvent extends AgEvent {}

export interface NewColumnsLoadedEvent extends AgEvent {}

export interface GridColumnsChangedEvent extends AgEvent {}

export interface DisplayedColumnsWidthChangedEvent extends AgEvent {}

export interface DisplayedColumnsChangedEvent extends AgEvent {}

export interface ColumnGroupOpenedEvent extends AgEvent {
    columnGroup: ColumnGroup
}

export interface ColumnEvent extends AgEvent {
    column: Column;
    columns: Column[];
}

export interface ColumnResizedEvent extends ColumnEvent {
    finished: boolean;
}

export interface ColumnPivotChangedEvent extends ColumnEvent {}

export interface ColumnRowGroupChangedEvent extends ColumnEvent {}

export interface ColumnValueChangedEvent extends ColumnEvent {}

export interface ColumnMovedEvent extends ColumnEvent {
    toIndex: number;
}

export interface ColumnVisibleEvent extends ColumnEvent {
    visible: boolean;
}

export interface ColumnPinnedEvent extends ColumnEvent {
    pinned: string;
}

export interface RowEvent extends AgEvent {
    node: RowNode;
    data: any;
    rowIndex: number;
    context: any;
    api: GridApi;
    columnApi: ColumnApi;
    event?: Event;
}

export interface CellEvent extends RowEvent {
    column: Column;
    colDef: ColDef;
    value: any;
}

export interface CellClickedEvent extends CellEvent {}

export interface CellDoubleClickedEvent extends CellEvent {}

export interface CellMouseOverEvent extends CellEvent {}

export interface CellMouseOutEvent extends CellEvent {}

export interface CellContextMenuEvent extends CellEvent {}

export interface RowGroupOpenedEvent extends RowEvent {}

export interface RowDataChangedEvent extends AgEvent {}

export interface RowDataUpdatedEvent extends AgEvent {}

export interface PinnedRowDataChangedEvent extends AgEvent {}

export interface RangeSelectionChangedEvent extends AgEvent {
    finished: boolean;
    started: boolean;
}

export interface RowValueChangedEvent extends RowEvent {}

export interface CellFocusedEvent extends AgEvent {
    rowIndex: number;
    column: Column;
    floating: string;
    forceBrowserFocus: boolean;
}

export interface RowSelectedEvent extends RowEvent {}

export interface SelectionChangedEvent extends AgEvent {}

export interface ColumnHoverChangedEvent extends AgEvent {}

export interface FilterChangedEvent extends AgEvent {}

export interface FilterModifiedEvent extends AgEvent {}

export interface SortChangedEvent extends AgEvent {}

export interface VirtualRowRemovedEvent extends RowEvent {}

export interface RowClickedEvent extends RowEvent {}

export interface RowDoubleClickedEvent extends RowEvent {}

export interface GridReadyEvent extends AgEvent {
    api: GridApi;
    columnApi: ColumnApi;
}

export interface GridSizeChangedEvent extends AgEvent {
    clientWidth: number;
    clientHeight: number;
}

export interface ViewportChangedEvent extends AgEvent {
    firstRow: number;
    lastRow: number;
}

export interface DragStartedEvent extends AgEvent {
}

export interface DragStoppedEvent extends AgEvent {
}

export interface RowEditingStartedEvent extends RowEvent {}
export interface RowEditingStoppedEvent extends RowEvent {}

export interface CellEditingStartedEvent extends CellEvent {}
export interface CellEditingStoppedEvent extends CellEvent {}

export interface ItemsEvent extends AgEvent {
    items: RowNode[]
}

export interface ItemsAddedEvent extends ItemsEvent {}

export interface BodyScrollEvent extends AgEvent {
    direction: string;
}

export interface FlashCellsEvent extends AgEvent {
    cells: any;
}

export interface PaginationChangedEvent extends AgEvent {
    animate: boolean;
    keepRenderedRows: boolean;
    newData: boolean;
    newPage: boolean;
}

export interface BodyHeightChangedEvent extends AgEvent {}

export interface ScrollVisibilityChangedEvent extends AgEvent {}

export interface ColumnRequestEvent extends AgEvent {
    columns: Column[]
}

export interface ColumnRowGroupChangeRequestEvent extends ColumnRequestEvent {}
export interface ColumnPivotChangeRequestEvent extends ColumnRequestEvent {}
export interface ColumnValueChangeRequestEvent extends ColumnRequestEvent {}
export interface ColumnAggFuncChangeRequestEvent extends ColumnRequestEvent {}
