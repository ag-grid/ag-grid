// Type definitions for ag-grid v13.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
import { ColDef } from "./entities/colDef";
import { GridApi } from "./gridApi";
import { ColumnApi } from "./columnController/columnController";
import { OriginalColumnGroup } from "./entities/originalColumnGroup";
export declare class Events {
    /** Everything has changed with the columns. Either complete new set of columns set, or user called setState()*/
    static EVENT_COLUMN_EVERYTHING_CHANGED: string;
    /** User has set in new columns. */
    static EVENT_NEW_COLUMNS_LOADED: string;
    /** The pivot mode flag was changed */
    static EVENT_COLUMN_PIVOT_MODE_CHANGED: string;
    /** A row group column was added, removed or order changed. */
    static EVENT_COLUMN_ROW_GROUP_CHANGED: string;
    /** A pivot column was added, removed or order changed. */
    static EVENT_COLUMN_PIVOT_CHANGED: string;
    /** The list of grid columns has changed. */
    static EVENT_GRID_COLUMNS_CHANGED: string;
    /** A value column was added, removed or agg function was changed. */
    static EVENT_COLUMN_VALUE_CHANGED: string;
    /** A column was moved */
    static EVENT_COLUMN_MOVED: string;
    /** One or more columns was shown / hidden */
    static EVENT_COLUMN_VISIBLE: string;
    /** One or more columns was pinned / unpinned*/
    static EVENT_COLUMN_PINNED: string;
    /** A column group was opened / closed */
    static EVENT_COLUMN_GROUP_OPENED: string;
    /** One or more columns was resized. If just one, the column in the event is set. */
    static EVENT_COLUMN_RESIZED: string;
    /** The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc */
    static EVENT_DISPLAYED_COLUMNS_CHANGED: string;
    /** The list of virtual columns has changed, results from viewport changing */
    static EVENT_VIRTUAL_COLUMNS_CHANGED: string;
    /** A row group was opened / closed */
    static EVENT_ROW_GROUP_OPENED: string;
    /** The client has set new data into the grid */
    static EVENT_ROW_DATA_CHANGED: string;
    /** The client has updated data for the grid */
    static EVENT_ROW_DATA_UPDATED: string;
    /** The client has set new floating data into the grid */
    static EVENT_PINNED_ROW_DATA_CHANGED: string;
    /** Range selection has changed */
    static EVENT_RANGE_SELECTION_CHANGED: string;
    /** Model was updated - grid updates the drawn rows when this happens */
    static EVENT_MODEL_UPDATED: string;
    static EVENT_CELL_CLICKED: string;
    static EVENT_CELL_DOUBLE_CLICKED: string;
    static EVENT_CELL_CONTEXT_MENU: string;
    static EVENT_CELL_VALUE_CHANGED: string;
    static EVENT_ROW_VALUE_CHANGED: string;
    static EVENT_CELL_FOCUSED: string;
    static EVENT_ROW_SELECTED: string;
    static EVENT_SELECTION_CHANGED: string;
    static EVENT_CELL_MOUSE_OVER: string;
    static EVENT_CELL_MOUSE_OUT: string;
    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    static EVENT_FILTER_CHANGED: string;
    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    static EVENT_FILTER_MODIFIED: string;
    static EVENT_SORT_CHANGED: string;
    /** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
    static EVENT_VIRTUAL_ROW_REMOVED: string;
    static EVENT_ROW_CLICKED: string;
    static EVENT_ROW_DOUBLE_CLICKED: string;
    /** Gets called once after the grid has finished initialising. */
    static EVENT_GRID_READY: string;
    /** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
     * changed, so always filling the space it was given. */
    static EVENT_GRID_SIZE_CHANGED: string;
    /** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
    static EVENT_VIEWPORT_CHANGED: string;
    /** A column drag has started, either resizing a column or moving a column. */
    static EVENT_DRAG_STARTED: string;
    /** A column drag has stopped */
    static EVENT_DRAG_STOPPED: string;
    static EVENT_ROW_EDITING_STARTED: string;
    static EVENT_ROW_EDITING_STOPPED: string;
    static EVENT_CELL_EDITING_STARTED: string;
    static EVENT_CELL_EDITING_STOPPED: string;
    /** Main body of grid has scrolled, either horizontally or vertically */
    static EVENT_BODY_SCROLL: string;
    /** The displayed page for pagination has changed. For example the data was filtered or sorted,
     * or the user has moved to a different page. */
    static EVENT_PAGINATION_CHANGED: string;
    /** Only used by React, Angular 2+, Web Components, Aurelia and VueJS ag-Grid components
     * (not used if doing plain JavaScript or Angular 1.x). If the grid receives changes due
     * to bound properties, this event fires after the grid has finished processing the change. */
    static EVENT_COMPONENT_STATE_CHANGED: string;
    /** All items from here down are used internally by the grid, not intended for external use. */
    static EVENT_BODY_HEIGHT_CHANGED: string;
    static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED: string;
    static EVENT_SCROLL_VISIBILITY_CHANGED: string;
    static EVENT_COLUMN_HOVER_CHANGED: string;
    static EVENT_FLASH_CELLS: string;
    static EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST: string;
    static EVENT_COLUMN_PIVOT_CHANGE_REQUEST: string;
    static EVENT_COLUMN_VALUE_CHANGE_REQUEST: string;
    static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST: string;
}
export interface ModelUpdatedEvent extends AgGridEvent {
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
export interface AgGridEvent extends AgEvent {
    api: GridApi;
    columnApi: ColumnApi;
}
export interface ColumnPivotModeChangedEvent extends AgGridEvent {
}
export interface VirtualColumnsChangedEvent extends AgGridEvent {
}
export interface ColumnEverythingChangedEvent extends AgGridEvent {
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
}
export interface SortChangedEvent extends AgGridEvent {
}
export interface GridReadyEvent extends AgGridEvent {
}
export interface DragStartedEvent extends AgGridEvent {
}
export interface DragStoppedEvent extends AgGridEvent {
}
export interface DisplayedColumnsWidthChangedEvent extends AgGridEvent {
}
export interface ColumnHoverChangedEvent extends AgGridEvent {
}
export interface BodyHeightChangedEvent extends AgGridEvent {
}
export interface ComponentStateChangedEvent extends AgGridEvent {
}
export interface GridSizeChangedEvent extends AgGridEvent {
    clientWidth: number;
    clientHeight: number;
}
export interface ViewportChangedEvent extends AgGridEvent {
    firstRow: number;
    lastRow: number;
}
export interface RangeSelectionChangedEvent extends AgGridEvent {
    finished: boolean;
    started: boolean;
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
export interface FlashCellsEvent extends AgGridEvent {
    cells: any;
}
export interface PaginationChangedEvent extends AgGridEvent {
    animate: boolean;
    keepRenderedRows: boolean;
    newData: boolean;
    newPage: boolean;
}
export interface CellFocusedEvent extends AgGridEvent {
    rowIndex: number;
    column: Column;
    rowPinned: string;
    forceBrowserFocus: boolean;
    floating: string;
}
/**---------------*/
/** COLUMN EVENTS */
/**---------------*/
export interface ColumnEvent extends AgGridEvent {
    column: Column;
    columns: Column[];
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
    toIndex: number;
}
export interface ColumnVisibleEvent extends ColumnEvent {
    visible: boolean;
}
export interface ColumnPinnedEvent extends ColumnEvent {
    pinned: string;
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
    event?: Event;
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
export interface CellClickedEvent extends CellEvent {
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
export interface ScrollVisibilityChangedEvent extends AgGridEvent {
}
