module awk.grid {

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
    }

}