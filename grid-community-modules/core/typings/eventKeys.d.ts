export declare class Events {
    /** Everything has changed with the columns. Either complete new set of columns set, or user called applyColumnState() */
    /** @deprecated - grid no longer uses this, and setSate() also fires individual events */
    static EVENT_COLUMN_EVERYTHING_CHANGED: 'columnEverythingChanged';
    /** User has set in new columns. */
    static EVENT_NEW_COLUMNS_LOADED: 'newColumnsLoaded';
    /** The pivot mode flag was changed */
    static EVENT_COLUMN_PIVOT_MODE_CHANGED: 'columnPivotModeChanged';
    /** A row group column was added, removed or order changed. */
    static EVENT_COLUMN_ROW_GROUP_CHANGED: 'columnRowGroupChanged';
    /** expandAll / collapseAll was called from the api. */
    static EVENT_EXPAND_COLLAPSE_ALL: 'expandOrCollapseAll';
    /** A pivot column was added, removed or order changed. */
    static EVENT_COLUMN_PIVOT_CHANGED: 'columnPivotChanged';
    /** The list of grid columns has changed. */
    static EVENT_GRID_COLUMNS_CHANGED: 'gridColumnsChanged';
    /** A value column was added, removed or agg function was changed. */
    static EVENT_COLUMN_VALUE_CHANGED: 'columnValueChanged';
    /** A column was moved */
    static EVENT_COLUMN_MOVED: 'columnMoved';
    /** One or more columns was shown / hidden */
    static EVENT_COLUMN_VISIBLE: 'columnVisible';
    /** One or more columns was pinned / unpinned*/
    static EVENT_COLUMN_PINNED: 'columnPinned';
    /** A column group was opened / closed */
    static EVENT_COLUMN_GROUP_OPENED: 'columnGroupOpened';
    /** One or more columns was resized. If just one, the column in the event is set. */
    static EVENT_COLUMN_RESIZED: 'columnResized';
    /** The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc */
    static EVENT_DISPLAYED_COLUMNS_CHANGED: 'displayedColumnsChanged';
    /** The list of virtual columns has changed, results from viewport changing */
    static EVENT_VIRTUAL_COLUMNS_CHANGED: 'virtualColumnsChanged';
    /** Async Transactions Executed */
    static EVENT_ASYNC_TRANSACTIONS_FLUSHED: 'asyncTransactionsFlushed';
    /** A row group was opened / closed */
    static EVENT_ROW_GROUP_OPENED: 'rowGroupOpened';
    /** @deprecated v28 use EVENT_ROW_DATA_UPDATED instead */
    static EVENT_ROW_DATA_CHANGED: 'rowDataChanged';
    /** The client has updated data for the grid */
    static EVENT_ROW_DATA_UPDATED: 'rowDataUpdated';
    /** The client has set new floating data into the grid */
    static EVENT_PINNED_ROW_DATA_CHANGED: 'pinnedRowDataChanged';
    /** Range selection has changed */
    static EVENT_RANGE_SELECTION_CHANGED: 'rangeSelectionChanged';
    /** Chart was created */
    static EVENT_CHART_CREATED: 'chartCreated';
    /** Chart Range selection has changed */
    static EVENT_CHART_RANGE_SELECTION_CHANGED: 'chartRangeSelectionChanged';
    /** Chart Options have changed */
    static EVENT_CHART_OPTIONS_CHANGED: 'chartOptionsChanged';
    /** Chart was destroyed */
    static EVENT_CHART_DESTROYED: 'chartDestroyed';
    /** For when the tool panel is shown / hidden */
    static EVENT_TOOL_PANEL_VISIBLE_CHANGED: 'toolPanelVisibleChanged';
    static EVENT_TOOL_PANEL_SIZE_CHANGED: 'toolPanelSizeChanged';
    /**
     * This is a replacement event for EVENT_TOOL_PANEL_VISIBLE_CHANGED. In v30, the original event interface will be dropped
     * and replaced with the new event (but using the old event type and interface name)
     */
    static EVENT_INTERNAL_TOOL_PANEL_VISIBLE_CHANGED: 'internalToolPanelVisibleChanged';
    static EVENT_COLUMN_PANEL_ITEM_DRAG_START: 'columnPanelItemDragStart';
    static EVENT_COLUMN_PANEL_ITEM_DRAG_END: 'columnPanelItemDragEnd';
    /** Model was updated - grid updates the drawn rows when this happens */
    static EVENT_MODEL_UPDATED: 'modelUpdated';
    static EVENT_PASTE_START: 'pasteStart';
    static EVENT_PASTE_END: 'pasteEnd';
    static EVENT_FILL_START: 'fillStart';
    static EVENT_FILL_END: 'fillEnd';
    /** Undo operation has started. */
    static EVENT_UNDO_STARTED: 'undoStarted';
    /** Undo operation has ended. */
    static EVENT_UNDO_ENDED: 'undoEnded';
    /** Redo operation has started. */
    static EVENT_REDO_STARTED: 'redoStarted';
    /** Redo operation has ended. */
    static EVENT_REDO_ENDED: 'redoEnded';
    static EVENT_KEY_SHORTCUT_CHANGED_CELL_START: 'keyShortcutChangedCellStart';
    static EVENT_KEY_SHORTCUT_CHANGED_CELL_END: 'keyShortcutChangedCellEnd';
    static EVENT_CELL_CLICKED: 'cellClicked';
    static EVENT_CELL_DOUBLE_CLICKED: 'cellDoubleClicked';
    static EVENT_CELL_MOUSE_DOWN: 'cellMouseDown';
    static EVENT_CELL_CONTEXT_MENU: 'cellContextMenu';
    static EVENT_CELL_VALUE_CHANGED: 'cellValueChanged';
    static EVENT_CELL_EDIT_REQUEST: 'cellEditRequest';
    static EVENT_ROW_VALUE_CHANGED: 'rowValueChanged';
    static EVENT_CELL_FOCUSED: 'cellFocused';
    static EVENT_CELL_FOCUS_CLEARED: 'cellFocusCleared';
    static EVENT_FULL_WIDTH_ROW_FOCUSED: 'fullWidthRowFocused';
    static EVENT_ROW_SELECTED: 'rowSelected';
    static EVENT_SELECTION_CHANGED: 'selectionChanged';
    static EVENT_CELL_KEY_DOWN: 'cellKeyDown';
    static EVENT_CELL_KEY_PRESS: 'cellKeyPress';
    static EVENT_CELL_MOUSE_OVER: 'cellMouseOver';
    static EVENT_CELL_MOUSE_OUT: 'cellMouseOut';
    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    static EVENT_FILTER_CHANGED: 'filterChanged';
    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    static EVENT_FILTER_MODIFIED: 'filterModified';
    static EVENT_FILTER_OPENED: 'filterOpened';
    static EVENT_SORT_CHANGED: 'sortChanged';
    /** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
    static EVENT_VIRTUAL_ROW_REMOVED: 'virtualRowRemoved';
    static EVENT_ROW_CLICKED: 'rowClicked';
    static EVENT_ROW_DOUBLE_CLICKED: 'rowDoubleClicked';
    /** Gets called once after the grid has finished initialising. */
    static EVENT_GRID_READY: 'gridReady';
    /** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
     * changed, so always filling the space it was given. */
    static EVENT_GRID_SIZE_CHANGED: 'gridSizeChanged';
    /** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
    static EVENT_VIEWPORT_CHANGED: 'viewportChanged';
    static EVENT_SCROLLBAR_WIDTH_CHANGED: 'scrollbarWidthChanged';
    /** Rows were rendered for the first time (ie on async data load). */
    static EVENT_FIRST_DATA_RENDERED: 'firstDataRendered';
    /** A column drag has started, either resizing a column or moving a column. */
    static EVENT_DRAG_STARTED: 'dragStarted';
    /** A column drag has stopped */
    static EVENT_DRAG_STOPPED: 'dragStopped';
    static EVENT_CHECKBOX_CHANGED: 'checkboxChanged';
    static EVENT_ROW_EDITING_STARTED: 'rowEditingStarted';
    static EVENT_ROW_EDITING_STOPPED: 'rowEditingStopped';
    static EVENT_CELL_EDITING_STARTED: 'cellEditingStarted';
    static EVENT_CELL_EDITING_STOPPED: 'cellEditingStopped';
    /** Main body of grid has scrolled, either horizontally or vertically */
    static EVENT_BODY_SCROLL: 'bodyScroll';
    /** Main body of the grid has stopped scrolling, either horizontally or vertically */
    static EVENT_BODY_SCROLL_END: 'bodyScrollEnd';
    static EVENT_HEIGHT_SCALE_CHANGED: 'heightScaleChanged';
    /** The displayed page for pagination has changed. For example the data was filtered or sorted,
     * or the user has moved to a different page. */
    static EVENT_PAGINATION_CHANGED: 'paginationChanged';
    /** Only used by React, Angular, Web Components and VueJS AG Grid components
     * (not used if doing plain JavaScript). If the grid receives changes due
     * to bound properties, this event fires after the grid has finished processing the change. */
    static EVENT_COMPONENT_STATE_CHANGED: 'componentStateChanged';
    /*****************************  INTERNAL EVENTS: START ******************************************* */
    /** Please remember to add to ComponentUtil.EXCLUDED_INTERNAL_EVENTS to not have these events exposed to framework components. */
    /** All items from here down are used internally by the grid, not intended for external use. */
    static EVENT_BODY_HEIGHT_CHANGED: 'bodyHeightChanged';
    static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED: 'displayedColumnsWidthChanged';
    static EVENT_SCROLL_VISIBILITY_CHANGED: 'scrollVisibilityChanged';
    static EVENT_COLUMN_HOVER_CHANGED: 'columnHoverChanged';
    static EVENT_FLASH_CELLS: 'flashCells';
    static EVENT_PAGINATION_PIXEL_OFFSET_CHANGED: 'paginationPixelOffsetChanged';
    static EVENT_DISPLAYED_ROWS_CHANGED: 'displayedRowsChanged';
    static EVENT_LEFT_PINNED_WIDTH_CHANGED: 'leftPinnedWidthChanged';
    static EVENT_RIGHT_PINNED_WIDTH_CHANGED: 'rightPinnedWidthChanged';
    static EVENT_ROW_CONTAINER_HEIGHT_CHANGED: 'rowContainerHeightChanged';
    static EVENT_HEADER_HEIGHT_CHANGED: 'headerHeightChanged';
    static EVENT_COLUMN_HEADER_HEIGHT_CHANGED: 'columnHeaderHeightChanged';
    static EVENT_ROW_DRAG_ENTER: 'rowDragEnter';
    static EVENT_ROW_DRAG_MOVE: 'rowDragMove';
    static EVENT_ROW_DRAG_LEAVE: 'rowDragLeave';
    static EVENT_ROW_DRAG_END: 'rowDragEnd';
    static EVENT_GRID_STYLES_CHANGED: 'gridStylesChanged';
    static EVENT_POPUP_TO_FRONT: 'popupToFront';
    static EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST: 'columnRowGroupChangeRequest';
    static EVENT_COLUMN_PIVOT_CHANGE_REQUEST: 'columnPivotChangeRequest';
    static EVENT_COLUMN_VALUE_CHANGE_REQUEST: 'columnValueChangeRequest';
    static EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST: 'columnAggFuncChangeRequest';
    static EVENT_KEYBOARD_FOCUS: 'keyboardFocus';
    static EVENT_MOUSE_FOCUS: 'mouseFocus';
    static EVENT_STORE_UPDATED: 'storeUpdated';
    static EVENT_FILTER_DESTROYED: 'filterDestroyed';
}
