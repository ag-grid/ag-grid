export class Events {

    /** Everything has changed with the columns. Either complete new set of columns set, or user called setState()*/
    public static EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';

    /** User has set in new columns. */
    public static EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded';

    /** The pivot mode flag was changed */
    public static EVENT_COLUMN_PIVOT_MODE_CHANGED = 'columnPivotModeChanged';

    /** A row group column was added, removed or order changed. */
    public static EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';

    /** expandAll / collapseAll was called from the api. */
    public static EVENT_EXPAND_COLLAPSE_ALL = 'expandOrCollapseAll';

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

    /** The client has updated data for the grid */
    public static EVENT_ROW_DATA_UPDATED = 'rowDataUpdated';

    /** The client has set new floating data into the grid */
    public static EVENT_PINNED_ROW_DATA_CHANGED = 'pinnedRowDataChanged';

    /** Range selection has changed */
    public static EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged';

    /** Chart Range selection has changed */
    public static EVENT_CHART_RANGE_SELECTION_CHANGED = 'chartRangeSelectionChanged';

    /** Chart Options have changed */
    public static EVENT_CHART_OPTIONS_CHANGED = 'chartOptionsChanged';

    /** For when the tool panel is shown / hidden */
    public static EVENT_TOOL_PANEL_VISIBLE_CHANGED = 'toolPanelVisibleChanged';

    /** Model was updated - grid updates the drawn rows when this happens */
    public static EVENT_MODEL_UPDATED = 'modelUpdated';

    public static EVENT_PASTE_START = 'pasteStart';
    public static EVENT_PASTE_END = 'pasteEnd';

    public static EVENT_CELL_CLICKED = 'cellClicked';
    public static EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
    public static EVENT_CELL_MOUSE_DOWN = 'cellMouseDown';
    public static EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
    public static EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
    public static EVENT_ROW_VALUE_CHANGED = 'rowValueChanged';
    public static EVENT_CELL_FOCUSED = 'cellFocused';
    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_SELECTION_CHANGED = 'selectionChanged';

    public static EVENT_CELL_KEY_DOWN = 'cellKeyDown';
    public static EVENT_CELL_KEY_PRESS = 'cellKeyPress';

    public static EVENT_CELL_MOUSE_OVER = 'cellMouseOver';
    public static EVENT_CELL_MOUSE_OUT = 'cellMouseOut';

    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    public static EVENT_FILTER_CHANGED = 'filterChanged';

    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    public static EVENT_FILTER_MODIFIED = 'filterModified';
    public static EVENT_FILTER_OPENED = 'filterOpened';

    public static EVENT_SORT_CHANGED = 'sortChanged';

    /** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
    public static EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';

    public static EVENT_ROW_CLICKED = 'rowClicked';
    public static EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';

    /** Gets called once after the grid has finished initialising. */
    public static EVENT_GRID_READY = 'gridReady';
    /** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
     * changed, so always filling the space it was given. */
    public static EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
    /** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
    public static EVENT_VIEWPORT_CHANGED = 'viewportChanged';
    /** Rows were rendered for the first time (ie on async data load). */
    public static EVENT_FIRST_DATA_RENDERED = 'firstDataRendered';
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

    public static EVENT_ANIMATION_QUEUE_EMPTY = 'animationQueueEmpty';

    public static EVENT_HEIGHT_SCALE_CHANGED = 'heightScaleChanged';

    /** The displayed page for pagination has changed. For example the data was filtered or sorted,
     * or the user has moved to a different page. */
    public static EVENT_PAGINATION_CHANGED = 'paginationChanged';

    /** Only used by React, Angular 2+, Web Components and VueJS ag-Grid components
     * (not used if doing plain JavaScript or Angular 1.x). If the grid receives changes due
     * to bound properties, this event fires after the grid has finished processing the change. */
    public static EVENT_COMPONENT_STATE_CHANGED = 'componentStateChanged';

    /** All items from here down are used internally by the grid, not intended for external use. */
    // not documented, either experimental, or we just don't want users using an depending on them
    public static EVENT_BODY_HEIGHT_CHANGED = 'bodyHeightChanged';
    public static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED = 'displayedColumnsWidthChanged';
    public static EVENT_SCROLL_VISIBILITY_CHANGED = 'scrollVisibilityChanged';
    public static EVENT_COLUMN_HOVER_CHANGED = 'columnHoverChanged';
    public static EVENT_FLASH_CELLS = 'flashCells';

    public static EVENT_ROW_DRAG_ENTER = 'rowDragEnter';
    public static EVENT_ROW_DRAG_MOVE = 'rowDragMove';
    public static EVENT_ROW_DRAG_LEAVE = 'rowDragLeave';
    public static EVENT_ROW_DRAG_END = 'rowDragEnd';

    // these are used for server side group and agg - only used by CS with Viewport Row Model - intention is
    // to design these better around server side functions and then release to general public when fully working with
    // all the row models.
    public static EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST = 'columnRowGroupChangeRequest';
    public static EVENT_COLUMN_PIVOT_CHANGE_REQUEST = 'columnPivotChangeRequest';
    public static EVENT_COLUMN_VALUE_CHANGE_REQUEST = 'columnValueChangeRequest';
    public static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST = 'columnAggFuncChangeRequest';
}
