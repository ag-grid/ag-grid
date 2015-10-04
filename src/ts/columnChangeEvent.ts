/// <references path='events.ts'/>

module ag.grid {

    export class ColumnChangeEvent {

        private type: string;
        private column: Column;
        private columnGroup: ColumnGroup;
        private fromIndex: number;
        private toIndex: number;
        private pinnedColumnCount: number;
        private finished: boolean;

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
            if (typeof this.finished == 'boolean') { result += ', finished: ' + this.finished; }
            result += '}';
            return result;
        }

        public withColumn(column: Column): ColumnChangeEvent {
            this.column = column;
            return this;
        }

        public withFinished(finished: boolean): ColumnChangeEvent {
            this.finished = finished;
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
            return this.type === Events.EVENT_COLUMN_PIVOT_CHANGE || this.type === Events.EVENT_COLUMN_EVERYTHING_CHANGED;
        }

        public isValueChanged(): boolean {
            return this.type === Events.EVENT_COLUMN_VALUE_CHANGE || this.type === Events.EVENT_COLUMN_EVERYTHING_CHANGED;
        }

        public isIndividualColumnResized(): boolean {
            return this.type === Events.EVENT_COLUMN_RESIZED && this.column !== undefined && this.column !== null;
        }

        public isFinished(): boolean {
            return this.finished;
        }

    }

}