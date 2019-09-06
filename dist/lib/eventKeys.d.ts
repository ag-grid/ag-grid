// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class Events {
    /** Everything has changed with the columns. Either complete new set of columns set, or user called setState()*/
    static EVENT_COLUMN_EVERYTHING_CHANGED: string;
    /** User has set in new columns. */
    static EVENT_NEW_COLUMNS_LOADED: string;
    /** The pivot mode flag was changed */
    static EVENT_COLUMN_PIVOT_MODE_CHANGED: string;
    /** A row group column was added, removed or order changed. */
    static EVENT_COLUMN_ROW_GROUP_CHANGED: string;
    /** expandAll / collapseAll was called from the api. */
    static EVENT_EXPAND_COLLAPSE_ALL: string;
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
    /** Chart Range selection has changed */
    static EVENT_CHART_RANGE_SELECTION_CHANGED: string;
    /** Chart Options have changed */
    static EVENT_CHART_OPTIONS_CHANGED: string;
    /** For when the tool panel is shown / hidden */
    static EVENT_TOOL_PANEL_VISIBLE_CHANGED: string;
    /** Model was updated - grid updates the drawn rows when this happens */
    static EVENT_MODEL_UPDATED: string;
    static EVENT_PASTE_START: string;
    static EVENT_PASTE_END: string;
    static EVENT_CELL_CLICKED: string;
    static EVENT_CELL_DOUBLE_CLICKED: string;
    static EVENT_CELL_MOUSE_DOWN: string;
    static EVENT_CELL_CONTEXT_MENU: string;
    static EVENT_CELL_VALUE_CHANGED: string;
    static EVENT_ROW_VALUE_CHANGED: string;
    static EVENT_CELL_FOCUSED: string;
    static EVENT_ROW_SELECTED: string;
    static EVENT_SELECTION_CHANGED: string;
    static EVENT_CELL_KEY_DOWN: string;
    static EVENT_CELL_KEY_PRESS: string;
    static EVENT_CELL_MOUSE_OVER: string;
    static EVENT_CELL_MOUSE_OUT: string;
    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    static EVENT_FILTER_CHANGED: string;
    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    static EVENT_FILTER_MODIFIED: string;
    static EVENT_FILTER_OPENED: string;
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
    /** Rows were rendered for the first time (ie on async data load). */
    static EVENT_FIRST_DATA_RENDERED: string;
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
    static EVENT_ANIMATION_QUEUE_EMPTY: string;
    static EVENT_HEIGHT_SCALE_CHANGED: string;
    /** The displayed page for pagination has changed. For example the data was filtered or sorted,
     * or the user has moved to a different page. */
    static EVENT_PAGINATION_CHANGED: string;
    /** Only used by React, Angular 2+, Web Components and VueJS ag-Grid components
     * (not used if doing plain JavaScript or Angular 1.x). If the grid receives changes due
     * to bound properties, this event fires after the grid has finished processing the change. */
    static EVENT_COMPONENT_STATE_CHANGED: string;
    /** All items from here down are used internally by the grid, not intended for external use. */
    static EVENT_BODY_HEIGHT_CHANGED: string;
    static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED: string;
    static EVENT_SCROLL_VISIBILITY_CHANGED: string;
    static EVENT_COLUMN_HOVER_CHANGED: string;
    static EVENT_FLASH_CELLS: string;
    static EVENT_ROW_DRAG_ENTER: string;
    static EVENT_ROW_DRAG_MOVE: string;
    static EVENT_ROW_DRAG_LEAVE: string;
    static EVENT_ROW_DRAG_END: string;
    static EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST: string;
    static EVENT_COLUMN_PIVOT_CHANGE_REQUEST: string;
    static EVENT_COLUMN_VALUE_CHANGE_REQUEST: string;
    static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST: string;
}
