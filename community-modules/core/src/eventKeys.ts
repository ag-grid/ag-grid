export class Events {
    /** Everything has changed with the columns. Either complete new set of columns set, or user called applyColumnState() */
    public static EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged' as const;

    /** User has set in new columns. */
    public static EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded' as const;

    /** The pivot mode flag was changed */
    public static EVENT_COLUMN_PIVOT_MODE_CHANGED = 'columnPivotModeChanged' as const;

    /** Exceeded the pivot limit when generating columns */
    public static EVENT_PIVOT_MAX_COLUMNS_EXCEEDED = 'pivotMaxColumnsExceeded' as const;

    /** A row group column was added, removed or order changed. */
    public static EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged' as const;

    /** expandAll / collapseAll was called from the api. */
    public static EVENT_EXPAND_COLLAPSE_ALL = 'expandOrCollapseAll' as const;

    /** A pivot column was added, removed or order changed. */
    public static EVENT_COLUMN_PIVOT_CHANGED = 'columnPivotChanged' as const;

    /** The list of grid columns has changed. */
    public static EVENT_GRID_COLUMNS_CHANGED = 'gridColumnsChanged' as const;

    /** A value column was added, removed or agg function was changed. */
    public static EVENT_COLUMN_VALUE_CHANGED = 'columnValueChanged' as const;

    /** A column was moved */
    public static EVENT_COLUMN_MOVED = 'columnMoved' as const;

    /** One or more columns was shown / hidden */
    public static EVENT_COLUMN_VISIBLE = 'columnVisible' as const;

    /** One or more columns was pinned / unpinned*/
    public static EVENT_COLUMN_PINNED = 'columnPinned' as const;

    /** A column group was opened / closed */
    public static EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened' as const;

    /** One or more columns was resized. If just one, the column in the event is set. */
    public static EVENT_COLUMN_RESIZED = 'columnResized' as const;

    /** The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc */
    public static EVENT_DISPLAYED_COLUMNS_CHANGED = 'displayedColumnsChanged' as const;

    /** The grid option related to suppressing movable columns has changed */
    public static EVENT_SUPPRESS_COLUMN_MOVE_CHANGED = 'suppressMovableColumns' as const;

    /** The grid option related to suppressing column group selection has changed */
    public static EVENT_SUPPRESS_MENU_HIDE_CHANGED = 'suppressMenuHide' as const;

    /** The grid option related to suppressing movable columns has changed */
    public static EVENT_SUPPRESS_FIELD_DOT_NOTATION = 'suppressFieldDotNotation' as const;

    /** The list of virtual columns has changed, results from viewport changing */
    public static EVENT_VIRTUAL_COLUMNS_CHANGED = 'virtualColumnsChanged' as const;

    /** Column header mouse over */
    public static EVENT_COLUMN_HEADER_MOUSE_OVER = 'columnHeaderMouseOver' as const;

    /** Column header mouse leave */
    public static EVENT_COLUMN_HEADER_MOUSE_LEAVE = 'columnHeaderMouseLeave' as const;

    /** Column header clicked */
    public static EVENT_COLUMN_HEADER_CLICKED = 'columnHeaderClicked' as const;

    /** Column header context menu event, such as right-click or context menu key press */
    public static EVENT_COLUMN_HEADER_CONTEXT_MENU = 'columnHeaderContextMenu' as const;

    /** Async Transactions Executed */
    public static EVENT_ASYNC_TRANSACTIONS_FLUSHED = 'asyncTransactionsFlushed' as const;

    /** A row group was opened / closed */
    public static EVENT_ROW_GROUP_OPENED = 'rowGroupOpened' as const;

    /** Client-Side Row Model only. The client has updated data for the grid */
    public static EVENT_ROW_DATA_UPDATED = 'rowDataUpdated' as const;

    /** The client has set new floating data into the grid */
    public static EVENT_PINNED_ROW_DATA_CHANGED = 'pinnedRowDataChanged' as const;

    /** The client has set new floating data into the grid */
    public static EVENT_PINNED_HEIGHT_CHANGED = 'pinnedHeightChanged' as const;

    /** Range selection has changed */
    public static EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged' as const;

    /** Chart was created */
    public static EVENT_CHART_CREATED = 'chartCreated' as const;

    /** Chart Range selection has changed */
    public static EVENT_CHART_RANGE_SELECTION_CHANGED = 'chartRangeSelectionChanged' as const;

    /** Chart Options have changed */
    public static EVENT_CHART_OPTIONS_CHANGED = 'chartOptionsChanged' as const;

    /** Chart was destroyed */
    public static EVENT_CHART_DESTROYED = 'chartDestroyed' as const;

    /** For when the tool panel is shown / hidden */
    public static EVENT_TOOL_PANEL_VISIBLE_CHANGED = 'toolPanelVisibleChanged' as const;
    public static EVENT_TOOL_PANEL_SIZE_CHANGED = 'toolPanelSizeChanged' as const;

    public static EVENT_COLUMN_PANEL_ITEM_DRAG_START = 'columnPanelItemDragStart' as const;
    public static EVENT_COLUMN_PANEL_ITEM_DRAG_END = 'columnPanelItemDragEnd' as const;

    /** Model was updated - grid updates the drawn rows when this happens */
    public static EVENT_MODEL_UPDATED = 'modelUpdated' as const;

    public static EVENT_CUT_START = 'cutStart' as const;
    public static EVENT_CUT_END = 'cutEnd' as const;

    public static EVENT_PASTE_START = 'pasteStart' as const;
    public static EVENT_PASTE_END = 'pasteEnd' as const;

    public static EVENT_FILL_START = 'fillStart' as const;
    public static EVENT_FILL_END = 'fillEnd' as const;

    public static EVENT_RANGE_DELETE_START = 'rangeDeleteStart' as const;
    public static EVENT_RANGE_DELETE_END = 'rangeDeleteEnd' as const;

    /** Undo operation has started. */
    public static EVENT_UNDO_STARTED = 'undoStarted' as const;
    /** Undo operation has ended. */
    public static EVENT_UNDO_ENDED = 'undoEnded' as const;
    /** Redo operation has started. */
    public static EVENT_REDO_STARTED = 'redoStarted' as const;
    /** Redo operation has ended. */
    public static EVENT_REDO_ENDED = 'redoEnded' as const;

    public static EVENT_KEY_SHORTCUT_CHANGED_CELL_START = 'keyShortcutChangedCellStart' as const;
    public static EVENT_KEY_SHORTCUT_CHANGED_CELL_END = 'keyShortcutChangedCellEnd' as const;

    public static EVENT_CELL_CLICKED = 'cellClicked' as const;
    public static EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked' as const;
    public static EVENT_CELL_MOUSE_DOWN = 'cellMouseDown' as const;
    public static EVENT_CELL_CONTEXT_MENU = 'cellContextMenu' as const;
    public static EVENT_CELL_VALUE_CHANGED = 'cellValueChanged' as const;
    public static EVENT_CELL_EDIT_REQUEST = 'cellEditRequest' as const;
    public static EVENT_ROW_VALUE_CHANGED = 'rowValueChanged' as const;
    public static EVENT_CELL_FOCUSED = 'cellFocused' as const;
    public static EVENT_CELL_FOCUS_CLEARED = 'cellFocusCleared' as const;
    public static EVENT_FULL_WIDTH_ROW_FOCUSED = 'fullWidthRowFocused' as const;
    public static EVENT_ROW_SELECTED = 'rowSelected' as const;
    public static EVENT_SELECTION_CHANGED = 'selectionChanged' as const;

    public static EVENT_TOOLTIP_SHOW = 'tooltipShow' as const;
    public static EVENT_TOOLTIP_HIDE = 'tooltipHide' as const;

    public static EVENT_CELL_KEY_DOWN = 'cellKeyDown' as const;

    public static EVENT_CELL_MOUSE_OVER = 'cellMouseOver' as const;
    public static EVENT_CELL_MOUSE_OUT = 'cellMouseOut' as const;

    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    public static EVENT_FILTER_CHANGED = 'filterChanged' as const;

    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    public static EVENT_FILTER_MODIFIED = 'filterModified' as const;
    public static EVENT_FILTER_OPENED = 'filterOpened' as const;

    public static EVENT_ADVANCED_FILTER_BUILDER_VISIBLE_CHANGED = 'advancedFilterBuilderVisibleChanged' as const;

    public static EVENT_SORT_CHANGED = 'sortChanged' as const;

    /** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
    public static EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved' as const;

    public static EVENT_ROW_CLICKED = 'rowClicked' as const;
    public static EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked' as const;

    /** Gets called once after the grid has finished initialising. */
    public static EVENT_GRID_READY = 'gridReady' as const;
    /** Called once when the grid is about to get destroyed. */
    public static EVENT_GRID_PRE_DESTROYED = 'gridPreDestroyed' as const;
    /** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
     * changed, so always filling the space it was given. */
    public static EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged' as const;
    /** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
    public static EVENT_VIEWPORT_CHANGED = 'viewportChanged' as const;
    /* The width of the scrollbar has been calculated */
    public static EVENT_SCROLLBAR_WIDTH_CHANGED = 'scrollbarWidthChanged' as const;
    /** Rows were rendered for the first time (ie on async data load). */
    public static EVENT_FIRST_DATA_RENDERED = 'firstDataRendered' as const;
    /** A column drag has started, either resizing a column or moving a column. */
    public static EVENT_DRAG_STARTED = 'dragStarted' as const;
    /** A column drag has stopped */
    public static EVENT_DRAG_STOPPED = 'dragStopped' as const;

    public static EVENT_CHECKBOX_CHANGED = 'checkboxChanged' as const;

    public static EVENT_ROW_EDITING_STARTED = 'rowEditingStarted' as const;
    public static EVENT_ROW_EDITING_STOPPED = 'rowEditingStopped' as const;

    public static EVENT_CELL_EDITING_STARTED = 'cellEditingStarted' as const;
    public static EVENT_CELL_EDITING_STOPPED = 'cellEditingStopped' as const;

    /** Main body of grid has scrolled, either horizontally or vertically */
    public static EVENT_BODY_SCROLL = 'bodyScroll' as const;

    /** Main body of the grid has stopped scrolling, either horizontally or vertically */
    public static EVENT_BODY_SCROLL_END = 'bodyScrollEnd' as const;

    public static EVENT_HEIGHT_SCALE_CHANGED = 'heightScaleChanged' as const;

    /** The displayed page for pagination has changed. For example the data was filtered or sorted,
     * or the user has moved to a different page. */
    public static EVENT_PAGINATION_CHANGED = 'paginationChanged' as const;

    /** Only used by React, Angular, Web Components and VueJS AG Grid components
     * (not used if doing plain JavaScript). If the grid receives changes due
     * to bound properties, this event fires after the grid has finished processing the change. */
    public static EVENT_COMPONENT_STATE_CHANGED = 'componentStateChanged' as const;

    /** Only used by the SSRM, called when the grid has no more rows to refresh */
    public static EVENT_STORE_REFRESHED = 'storeRefreshed' as const;

    public static EVENT_STATE_UPDATED = 'stateUpdated' as const;

    /** The visibility of the column menu has changed. */
    public static EVENT_COLUMN_MENU_VISIBLE_CHANGED = 'columnMenuVisibleChanged' as const;

    /** The visibility of the context menu has changed. */
    public static EVENT_CONTEXT_MENU_VISIBLE_CHANGED = 'contextMenuVisibleChanged' as const;

    /*****************************  INTERNAL EVENTS: START ******************************************* */

    /** Please remember to add to ComponentUtil.EXCLUDED_INTERNAL_EVENTS to not have these events exposed to framework components. */

    /** All items from here down are used internally by the grid, not intended for external use. */
    // not documented, either experimental, or we just don't want users using an depending on them
    public static EVENT_BODY_HEIGHT_CHANGED = 'bodyHeightChanged' as const;
    public static EVENT_COLUMN_CONTAINER_WIDTH_CHANGED = 'columnContainerWidthChanged' as const;
    public static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED = 'displayedColumnsWidthChanged' as const;
    public static EVENT_SCROLL_VISIBILITY_CHANGED = 'scrollVisibilityChanged' as const;
    public static EVENT_COLUMN_HOVER_CHANGED = 'columnHoverChanged' as const;
    public static EVENT_FLASH_CELLS = 'flashCells' as const;
    public static EVENT_PAGINATION_PIXEL_OFFSET_CHANGED = 'paginationPixelOffsetChanged' as const;
    public static EVENT_DISPLAYED_ROWS_CHANGED = 'displayedRowsChanged' as const;

    public static EVENT_LEFT_PINNED_WIDTH_CHANGED = 'leftPinnedWidthChanged' as const;
    public static EVENT_RIGHT_PINNED_WIDTH_CHANGED = 'rightPinnedWidthChanged' as const;

    public static EVENT_ROW_CONTAINER_HEIGHT_CHANGED = 'rowContainerHeightChanged' as const;
    public static EVENT_HEADER_HEIGHT_CHANGED = 'headerHeightChanged' as const;
    public static EVENT_COLUMN_HEADER_HEIGHT_CHANGED = 'columnHeaderHeightChanged' as const;

    public static EVENT_ROW_DRAG_ENTER = 'rowDragEnter' as const;
    public static EVENT_ROW_DRAG_MOVE = 'rowDragMove' as const;
    public static EVENT_ROW_DRAG_LEAVE = 'rowDragLeave' as const;
    public static EVENT_ROW_DRAG_END = 'rowDragEnd' as const;

    // environment
    public static EVENT_GRID_STYLES_CHANGED = 'gridStylesChanged' as const;

    public static EVENT_STORE_UPDATED = 'storeUpdated' as const;

    public static EVENT_FILTER_DESTROYED = 'filterDestroyed' as const;

    public static EVENT_ROW_DATA_UPDATE_STARTED = 'rowDataUpdateStarted' as const;
    public static EVENT_ROW_COUNT_READY = 'rowCountReady' as const;

    // Advanced Filters
    public static EVENT_ADVANCED_FILTER_ENABLED_CHANGED = 'advancedFilterEnabledChanged' as const;
    public static EVENT_DATA_TYPES_INFERRED = 'dataTypesInferred' as const;

    // Widgets
    public static EVENT_FIELD_VALUE_CHANGED = 'fieldValueChanged' as const;
    public static EVENT_FIELD_PICKER_VALUE_SELECTED = 'fieldPickerValueSelected' as const;

    public static EVENT_SIDE_BAR_UPDATED = 'sideBarUpdated' as const;

    public static EVENT_ALIGNED_GRID_SCROLL = 'alignedGridScroll' as const;
    public static EVENT_ALIGNED_GRID_COLUMN = 'alignedGridColumn' as const;

    public static EVENT_GRID_OPTIONS_CHANGED = 'gridOptionsChanged' as const;

    /*****************************  INTERNAL EVENTS: END ******************************************* */
}

export type EventsType = {
    [key in keyof typeof Events]: (typeof Events)[key] extends string ? (typeof Events)[key] : never;
}[keyof typeof Events];
