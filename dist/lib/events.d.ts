// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class Events {
    /** A new set of columns has been entered, everything has potentially changed. */
    static EVENT_COLUMN_EVERYTHING_CHANGED: string;
    /** A row group column was added, removed or order changed. */
    static EVENT_COLUMN_ROW_GROUP_CHANGE: string;
    /** A value column was added, removed or agg function was changed. */
    static EVENT_COLUMN_VALUE_CHANGE: string;
    /** A column was moved */
    static EVENT_COLUMN_MOVED: string;
    /** One or more columns was shown / hidden */
    static EVENT_COLUMN_VISIBLE: string;
    /** One or more columns was pinned / unpinned*/
    static EVENT_COLUMN_PINNED: string;
    /** A column group was opened / closed */
    static EVENT_COLUMN_GROUP_OPENED: string;
    /** A column group was opened / closed */
    static EVENT_ROW_GROUP_OPENED: string;
    /** One or more columns was resized. If just one, the column in the event is set. */
    static EVENT_COLUMN_RESIZED: string;
    static EVENT_MODEL_UPDATED: string;
    static EVENT_CELL_CLICKED: string;
    static EVENT_CELL_DOUBLE_CLICKED: string;
    static EVENT_CELL_CONTEXT_MENU: string;
    static EVENT_CELL_VALUE_CHANGED: string;
    static EVENT_CELL_FOCUSED: string;
    static EVENT_ROW_SELECTED: string;
    static EVENT_ROW_DESELECTED: string;
    static EVENT_SELECTION_CHANGED: string;
    static EVENT_BEFORE_FILTER_CHANGED: string;
    static EVENT_AFTER_FILTER_CHANGED: string;
    static EVENT_FILTER_MODIFIED: string;
    static EVENT_BEFORE_SORT_CHANGED: string;
    static EVENT_AFTER_SORT_CHANGED: string;
    static EVENT_VIRTUAL_ROW_REMOVED: string;
    static EVENT_ROW_CLICKED: string;
    static EVENT_ROW_DOUBLE_CLICKED: string;
    static EVENT_GRID_READY: string;
    static EVENT_GRID_SIZE_CHANGED: string;
}
