/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var Events = (function () {
    function Events() {
    }
    /** A new set of columns has been entered, everything has potentially changed. */
    Events.EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
    /** A row group column was added, removed or order changed. */
    Events.EVENT_COLUMN_ROW_GROUP_CHANGE = 'columnRowGroupChanged';
    /** A value column was added, removed or agg function was changed. */
    Events.EVENT_COLUMN_VALUE_CHANGE = 'columnValueChanged';
    /** A column was moved */
    Events.EVENT_COLUMN_MOVED = 'columnMoved';
    /** One or more columns was shown / hidden */
    Events.EVENT_COLUMN_VISIBLE = 'columnVisible';
    /** One or more columns was pinned / unpinned*/
    Events.EVENT_COLUMN_PINNED = 'columnPinned';
    /** A column group was opened / closed */
    Events.EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';
    /** A column group was opened / closed */
    Events.EVENT_ROW_GROUP_OPENED = 'rowGroupOpened';
    /** One or more columns was resized. If just one, the column in the event is set. */
    Events.EVENT_COLUMN_RESIZED = 'columnResized';
    Events.EVENT_MODEL_UPDATED = 'modelUpdated';
    Events.EVENT_CELL_CLICKED = 'cellClicked';
    Events.EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
    Events.EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
    Events.EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
    Events.EVENT_CELL_FOCUSED = 'cellFocused';
    Events.EVENT_ROW_SELECTED = 'rowSelected';
    Events.EVENT_ROW_DESELECTED = 'rowDeselected';
    Events.EVENT_SELECTION_CHANGED = 'selectionChanged';
    Events.EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
    Events.EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
    Events.EVENT_FILTER_MODIFIED = 'filterModified';
    Events.EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
    Events.EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
    Events.EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
    Events.EVENT_ROW_CLICKED = 'rowClicked';
    Events.EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
    Events.EVENT_GRID_READY = 'gridReady';
    Events.EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
    return Events;
})();
exports.Events = Events;
