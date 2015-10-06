module ag.grid {

    export class Events {

        /** A new set of columns has been entered, everything has potentially changed. */
        public static EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';

        /** A pivot column was added, removed or order changed. */
        public static EVENT_COLUMN_PIVOT_CHANGE = 'columnPivotChanged';

        /** A value column was added, removed or agg function was changed. */
        public static EVENT_COLUMN_VALUE_CHANGE = 'columnValueChanged';

        /** A column was moved */
        public static EVENT_COLUMN_MOVED = 'columnMoved';

        /** One or more columns was shown / hidden */
        public static EVENT_COLUMN_VISIBLE = 'columnVisible';

        /** A column group was opened / closed */
        public static EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';

        /** One or more columns was resized. If just one, the column in the event is set. */
        public static EVENT_COLUMN_RESIZED = 'columnResized';

        /** One or more columns was resized. If just one, the column in the event is set. */
        public static EVENT_COLUMN_PINNED_COUNT_CHANGED = 'columnPinnedCountChanged';

        public static EVENT_MODEL_UPDATED = 'modelUpdated';
        public static EVENT_CELL_CLICKED = 'cellClicked';
        public static EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
        public static EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
        public static EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
        public static EVENT_CELL_FOCUSED = 'cellFocused';
        public static EVENT_ROW_SELECTED = 'rowSelected';
        public static EVENT_ROW_DESELECTED = 'rowDeselected';
        public static EVENT_SELECTION_CHANGED = 'selectionChanged';
        public static EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
        public static EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
        public static EVENT_FILTER_MODIFIED = 'filterModified';
        public static EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
        public static EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
        public static EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
        public static EVENT_ROW_CLICKED = 'rowClicked';
        public static EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
        public static EVENT_READY = 'ready';
    }

}