// Type definitions for ag-grid v5.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class Events {
    /** A new set of columns has been entered, everything has potentially changed. */
    static EVENT_COLUMN_EVERYTHING_CHANGED: string;
    static EVENT_NEW_COLUMNS_LOADED: string;
    /** The reduce flag was changed */
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
    static EVENT_ROW_DATA_CHANGED: string;
    static EVENT_FLOATING_ROW_DATA_CHANGED: string;
    static EVENT_RANGE_SELECTION_CHANGED: string;
    static EVENT_COLUMN_ROW_GROUP_ADD_REQUEST: string;
    static EVENT_COLUMN_ROW_GROUP_REMOVE_REQUEST: string;
    static EVENT_COLUMN_PIVOT_ADD_REQUEST: string;
    static EVENT_COLUMN_PIVOT_REMOVE_REQUEST: string;
    static EVENT_COLUMN_VALUE_ADD_REQUEST: string;
    static EVENT_COLUMN_VALUE_REMOVE_REQUEST: string;
    static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST: string;
    static EVENT_FLASH_CELLS: string;
    static EVENT_MODEL_UPDATED: string;
    static EVENT_CELL_CLICKED: string;
    static EVENT_CELL_DOUBLE_CLICKED: string;
    static EVENT_CELL_CONTEXT_MENU: string;
    static EVENT_CELL_VALUE_CHANGED: string;
    static EVENT_CELL_FOCUSED: string;
    static EVENT_ROW_SELECTED: string;
    static EVENT_SELECTION_CHANGED: string;
    static EVENT_BEFORE_FILTER_CHANGED: string;
    static EVENT_FILTER_CHANGED: string;
    static EVENT_AFTER_FILTER_CHANGED: string;
    static EVENT_FILTER_MODIFIED: string;
    static EVENT_BEFORE_SORT_CHANGED: string;
    static EVENT_SORT_CHANGED: string;
    static EVENT_AFTER_SORT_CHANGED: string;
    static EVENT_VIRTUAL_ROW_REMOVED: string;
    static EVENT_ROW_CLICKED: string;
    static EVENT_ROW_DOUBLE_CLICKED: string;
    static EVENT_GRID_READY: string;
    static EVENT_GRID_SIZE_CHANGED: string;
    static EVENT_VIEWPORT_CHANGED: string;
    static EVENT_DRAG_STARTED: string;
    static EVENT_DRAG_STOPPED: string;
    static EVENT_ITEMS_ADDED: string;
    static EVENT_ITEMS_REMOVED: string;
}
