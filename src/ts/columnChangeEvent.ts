
module awk.grid {

    export class ColumnChangeEvent {

        private type: string;
        private column: Column;

        /** A new set of columns has been entered, everything has potentially changed. */
        public static TYPE_EVERYTHING = 'everything';

        /** A pivot column was added, removed or order changed. */
        public static TYPE_PIVOT_CHANGE = 'pivot';

        /** A value column was added, removed or agg function was changed. */
        public static TYPE_VALUE_CHANGE = 'value';

        /** A column was moved */
        public static TYPE_COLUMN_MOVED = 'columnMoved';

        /** One or more columns was shown / hidden */
        public static TYPE_COLUMN_VISIBLE = 'columnVisible';

        /** A column group was opened / closed */
        public static TYPE_COLUMN_GROUP_OPENED = 'columnGroupOpened';

        /** One or more columns was resized. If just one, the column in the event is set. */
        public static TYPE_COLUMN_RESIZED = 'columnResized';

        constructor(type: string, column: Column) {
            this.type = type;
            this.column = column;
        }
        
        public getType(): string {
            return this.type;
        }

        public getColumn(): Column {
            return this.column;
        }

        public isPivotChanged(): boolean {
            return this.type === ColumnChangeEvent.TYPE_PIVOT_CHANGE || this.type === ColumnChangeEvent.TYPE_EVERYTHING;
        }

        public isValueChanged(): boolean {
            return this.type === ColumnChangeEvent.TYPE_VALUE_CHANGE || this.type === ColumnChangeEvent.TYPE_EVERYTHING;
        }

        public isIndividualColumnResized(): boolean {
            return this.type === ColumnChangeEvent.TYPE_COLUMN_RESIZED && this.column !== undefined && this.column !== null;
        }

    }

}