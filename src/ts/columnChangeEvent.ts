
module awk.grid {

    export class ColumnChangeEvent {

        private type: string;
        private column: Column;
        private columnGroup: ColumnGroup;
        private fromIndex: number;
        private toIndex: number;
        private pinnedColumnCount: number;

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

        /** One or more columns was resized. If just one, the column in the event is set. */
        public static TYPE_PINNED_COUNT_CHANGED = 'pinnedCountChanged';

        constructor(type: string) {
            this.type = type;
        }

        public toString(): string {
            var result = 'ColumnChangeEvent {type: ' + this.type;
            if (this.column) { result += ', column: ' + this.column.colId; }
            if (this.columnGroup) { result += ', columnGroup: ' + this.columnGroup.name; }
            if (this.fromIndex) { result += ', fromIndex: ' + this.fromIndex; }
            if (this.toIndex) { result += ', toIndex: ' + this.toIndex; }
            if (this.pinnedColumnCount) { result += ', pinnedColumnCount: ' + this.pinnedColumnCount; }
            result += '}';
            return result;
        }

        public withColumn(column: Column): ColumnChangeEvent {
            this.column = column;
            return this;
        }

        public withColumnGroup(columnGroup: ColumnGroup): ColumnChangeEvent {
            this.columnGroup = columnGroup;
            return this;
        }

        public withFromIndex(fromIndex: number): ColumnChangeEvent {
            this.fromIndex = fromIndex;
            return this;
        }

        public withPinnedColumnCount(pinnedColumnCount: number): ColumnChangeEvent {
            this.pinnedColumnCount = pinnedColumnCount;
            return this;
        }

        public withToIndex(toIndex: number): ColumnChangeEvent {
            this.toIndex = toIndex;
            return this;
        }

        public getFromIndex(): number  {
            return this.fromIndex;
        }

        public getToIndex(): number  {
            return this.toIndex;
        }

        public getPinnedColumnCount(): number  {
            return this.pinnedColumnCount;
        }

        public getType(): string {
            return this.type;
        }

        public getColumn(): Column {
            return this.column;
        }

        public getColumnGroup(): ColumnGroup {
            return this.columnGroup;
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