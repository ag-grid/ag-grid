/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var Events = (function () {
    function Events() {
    }
    return Events;
}());
/** Everything has changed with the columns. Either complete new set of columns set, or user called setState()*/
Events.EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
/** User has set in new columns. */
Events.EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded';
/** The pivot mode flag was changed */
Events.EVENT_COLUMN_PIVOT_MODE_CHANGED = 'columnPivotModeChanged';
/** A row group column was added, removed or order changed. */
Events.EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
/** A pivot column was added, removed or order changed. */
Events.EVENT_COLUMN_PIVOT_CHANGED = 'columnPivotChanged';
/** The list of grid columns has changed. */
Events.EVENT_GRID_COLUMNS_CHANGED = 'gridColumnsChanged';
/** A value column was added, removed or agg function was changed. */
Events.EVENT_COLUMN_VALUE_CHANGED = 'columnValueChanged';
/** A column was moved */
Events.EVENT_COLUMN_MOVED = 'columnMoved';
/** One or more columns was shown / hidden */
Events.EVENT_COLUMN_VISIBLE = 'columnVisible';
/** One or more columns was pinned / unpinned*/
Events.EVENT_COLUMN_PINNED = 'columnPinned';
/** A column group was opened / closed */
Events.EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';
/** One or more columns was resized. If just one, the column in the event is set. */
Events.EVENT_COLUMN_RESIZED = 'columnResized';
/** The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc */
Events.EVENT_DISPLAYED_COLUMNS_CHANGED = 'displayedColumnsChanged';
/** The list of virtual columns has changed, results from viewport changing */
Events.EVENT_VIRTUAL_COLUMNS_CHANGED = 'virtualColumnsChanged';
/** A row group was opened / closed */
Events.EVENT_ROW_GROUP_OPENED = 'rowGroupOpened';
/** The client has set new data into the grid */
Events.EVENT_ROW_DATA_CHANGED = 'rowDataChanged';
/** The client has set new floating data into the grid */
Events.EVENT_FLOATING_ROW_DATA_CHANGED = 'floatingRowDataChanged';
/** Range selection has changed */
Events.EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged';
/** Model was updated - grid updates the drawn rows when this happens */
Events.EVENT_MODEL_UPDATED = 'modelUpdated';
Events.EVENT_CELL_CLICKED = 'cellClicked';
Events.EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
Events.EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
Events.EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
Events.EVENT_ROW_VALUE_CHANGED = 'rowValueChanged';
Events.EVENT_CELL_FOCUSED = 'cellFocused';
Events.EVENT_ROW_SELECTED = 'rowSelected';
Events.EVENT_SELECTION_CHANGED = 'selectionChanged';
Events.EVENT_CELL_MOUSE_OVER = 'cellMouseOver';
Events.EVENT_CELL_MOUSE_OUT = 'cellMouseOut';
Events.EVENT_COLUMN_HOVER_CHANGED = 'columnHoverChanged';
/** 3 events for filtering. The grid LISTENS for filterChanged, and does the filter here. The before and after
 * are for the client, if it wants to do something before or after the filter getting applied. */
Events.EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
Events.EVENT_FILTER_CHANGED = 'filterChanged';
Events.EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
/** Filter was change but not applied. Only useful if apply buttons are used in filters. */
Events.EVENT_FILTER_MODIFIED = 'filterModified';
/** 3 events for sorting. The grid LISTENS for sortChanged, and does the filter here. The before and after
 * are for the client, if it wants to do something before or after the sort getting applied. */
Events.EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
Events.EVENT_SORT_CHANGED = 'sortChanged';
Events.EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
/** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
Events.EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
Events.EVENT_ROW_CLICKED = 'rowClicked';
Events.EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
/** Gets called once after the grid has finished initialising. */
Events.EVENT_GRID_READY = 'gridReady';
/** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
 * changed, so always filling the space it was given.  */
Events.EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
/** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
Events.EVENT_VIEWPORT_CHANGED = 'viewportChanged';
/** A column drag has started, either resizing a column or moving a column. */
Events.EVENT_DRAG_STARTED = 'dragStarted';
/** A column drag has stopped */
Events.EVENT_DRAG_STOPPED = 'dragStopped';
Events.EVENT_ROW_EDITING_STARTED = 'rowEditingStarted';
Events.EVENT_ROW_EDITING_STOPPED = 'rowEditingStopped';
Events.EVENT_CELL_EDITING_STARTED = 'cellEditingStarted';
Events.EVENT_CELL_EDITING_STOPPED = 'cellEditingStopped';
/** Client added a new row. */
Events.EVENT_ITEMS_ADDED = 'itemsAdded';
/** Client removed a row. */
Events.EVENT_ITEMS_REMOVED = 'itemsRemoved';
/** Main body of grid has scrolled, either horizontally or vertically */
Events.EVENT_BODY_SCROLL = 'bodyScroll';
/** All items from here down are used internally by the grid, not intended for external use. */
Events.EVENT_FLASH_CELLS = 'flashCells';
/** All the events from here down are experimental, should not be documented or used by ag-Grid customers */
// not documented, as it's experimental, don't want people with dependencies on this
Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED = 'displayedColumnsWidthChanged';
Events.EVENT_SCROLL_VISIBILITY_CHANGED = 'scrollVisibilityChanged';
// these are used for server side group and agg - only used by CS with Viewport Row Model - intention is
// to design these better around server side functions and then release to general public when fully working with
// all the row models.
Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST = 'columnRowGroupChangeRequest';
Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST = 'columnPivotChangeRequest';
Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST = 'columnValueChangeRequest';
Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST = 'columnAggFuncChangeRequest';
exports.Events = Events;
