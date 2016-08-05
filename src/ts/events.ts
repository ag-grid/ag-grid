export class Events {

    /** A new set of columns has been entered, everything has potentially changed. */
    public static EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
    public static EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded';

    /** The reduce flag was changed */
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

    public static EVENT_ROW_DATA_CHANGED = 'rowDataChanged';

    public static EVENT_FLOATING_ROW_DATA_CHANGED = 'floatingRowDataChanged';

    public static EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged';

    public static EVENT_COLUMN_ROW_GROUP_ADD_REQUEST = 'columnRowGroupAddRequest';
    public static EVENT_COLUMN_ROW_GROUP_REMOVE_REQUEST = 'columnRowGroupRemoveRequest';

    public static EVENT_COLUMN_PIVOT_ADD_REQUEST = 'columnPivotAddRequest';
    public static EVENT_COLUMN_PIVOT_REMOVE_REQUEST = 'columnPivotRemoveRequest';

    public static EVENT_COLUMN_VALUE_ADD_REQUEST = 'columnValueAddRequest';
    public static EVENT_COLUMN_VALUE_REMOVE_REQUEST = 'columnValueRemoveRequest';

    public static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST = 'columnAggFuncChangeRequest';

    public static EVENT_FLASH_CELLS = 'clipboardPaste';
    public static EVENT_MODEL_UPDATED = 'modelUpdated';
    public static EVENT_CELL_CLICKED = 'cellClicked';
    public static EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
    public static EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
    public static EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
    public static EVENT_CELL_FOCUSED = 'cellFocused';
    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_SELECTION_CHANGED = 'selectionChanged';
    public static EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
    public static EVENT_FILTER_CHANGED = 'filterChanged';
    public static EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
    public static EVENT_FILTER_MODIFIED = 'filterModified';
    public static EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
    public static EVENT_SORT_CHANGED = 'sortChanged';
    public static EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
    public static EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
    public static EVENT_ROW_CLICKED = 'rowClicked';
    public static EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
    public static EVENT_GRID_READY = 'gridReady';
    public static EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
    public static EVENT_VIEWPORT_CHANGED = 'viewportChanged';
    public static EVENT_DRAG_STARTED = 'dragStarted';
    public static EVENT_DRAG_STOPPED = 'dragStopped';

    public static EVENT_ITEMS_ADDED = 'itemsAdded';
    public static EVENT_ITEMS_REMOVED = 'itemsRemoved';

}
