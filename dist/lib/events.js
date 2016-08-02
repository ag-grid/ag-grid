/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var Events = (function () {
    function Events() {
    }
    /** A new set of columns has been entered, everything has potentially changed. */
    Events.EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
    Events.EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded';
    /** The reduce flag was changed */
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
    Events.EVENT_ROW_DATA_CHANGED = 'rowDataChanged';
    Events.EVENT_FLOATING_ROW_DATA_CHANGED = 'floatingRowDataChanged';
    Events.EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged';
    Events.EVENT_COLUMN_ROW_GROUP_ADD_REQUEST = 'columnRowGroupAddRequest';
    Events.EVENT_COLUMN_ROW_GROUP_REMOVE_REQUEST = 'columnRowGroupRemoveRequest';
    Events.EVENT_COLUMN_PIVOT_ADD_REQUEST = 'columnPivotAddRequest';
    Events.EVENT_COLUMN_PIVOT_REMOVE_REQUEST = 'columnPivotRemoveRequest';
    Events.EVENT_COLUMN_VALUE_ADD_REQUEST = 'columnValueAddRequest';
    Events.EVENT_COLUMN_VALUE_REMOVE_REQUEST = 'columnValueRemoveRequest';
    Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST = 'columnAggFuncChangeRequest';
    Events.EVENT_FLASH_CELLS = 'clipboardPaste';
    Events.EVENT_MODEL_UPDATED = 'modelUpdated';
    Events.EVENT_CELL_CLICKED = 'cellClicked';
    Events.EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
    Events.EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
    Events.EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
    Events.EVENT_CELL_FOCUSED = 'cellFocused';
    Events.EVENT_ROW_SELECTED = 'rowSelected';
    Events.EVENT_SELECTION_CHANGED = 'selectionChanged';
    Events.EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
    Events.EVENT_FILTER_CHANGED = 'filterChanged';
    Events.EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
    Events.EVENT_FILTER_MODIFIED = 'filterModified';
    Events.EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
    Events.EVENT_SORT_CHANGED = 'sortChanged';
    Events.EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
    Events.EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
    Events.EVENT_ROW_CLICKED = 'rowClicked';
    Events.EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
    Events.EVENT_GRID_READY = 'gridReady';
    Events.EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
    Events.EVENT_VIEWPORT_CHANGED = 'viewportChanged';
    Events.EVENT_DRAG_STARTED = 'dragStarted';
    Events.EVENT_DRAG_STOPPED = 'dragStopped';
    return Events;
})();
exports.Events = Events;
