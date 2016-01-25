/// <reference path="../constants.ts" />
/// <reference path="columnGroup.ts" />

module ag.grid {

    var constants = Constants;

    // Wrapper around a user provide column definition. The grid treats the column definition as ready only.
    // This class contains all the runtime information about a column, plus some logic (the definition has no logic).
    // This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
    // appear as a child of either the original tree or the displayed tree. However the relevant group classes
    // for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
    // can only appear in OriginalColumn tree).
    export class Column implements ColumnGroupChild, OriginalColumnGroupChild {

        public static PINNED_RIGHT = 'right';
        public static PINNED_LEFT = 'left';

        public static AGG_SUM = 'sum';
        public static AGG_MIN = 'min';
        public static AGG_MAX = 'max';

        public static SORT_ASC = 'asc';
        public static SORT_DESC = 'desc';

        private colDef: ColDef;
        private colId: any;

        private actualWidth: any;

        private visible: any;
        private pinned: string;
        private index: number;
        private aggFunc: string;
        private sort: string;
        private sortedAt: number;

        constructor(colDef: ColDef, actualWidth: any, colId: String) {
            this.colDef = colDef;
            this.actualWidth = actualWidth;
            this.visible = !colDef.hide;
            this.sort = colDef.sort;
            this.sortedAt = colDef.sortedAt;
            this.colId = colId;
            if (colDef.pinned === true || colDef.pinned === 'left') {
                this.pinned = 'left';
            } else if (colDef.pinned === 'right') {
                this.pinned = 'right';
            }
        }

        public getSort(): string {
            return this.sort;
        }

        public setSort(sort: string): void {
            this.sort = sort;
        }

        public getSortedAt(): number {
            return this.sortedAt;
        }

        public setSortedAt(sortedAt: number): void {
            this.sortedAt = sortedAt;
        }

        public setAggFunc(aggFunc: string): void {
            this.aggFunc = aggFunc;
        }

        public getAggFunc(): string {
            return this.aggFunc;
        }

        public getIndex(): number {
            return this.index;
        }

        public setIndex(index: number): void {
            this.index = index;
        }

        public setPinned(pinned: string|boolean): void {
            if (pinned===true || pinned===Column.PINNED_LEFT) {
                this.pinned = Column.PINNED_LEFT;
            } else if (pinned===Column.PINNED_RIGHT) {
                this.pinned = Column.PINNED_RIGHT;
            } else {
                this.pinned = null;
            }
        }

        public isPinned(): boolean {
            return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
        }

        public getPinned(): string {
            return this.pinned;
        }

        public setVisible(visible: boolean): void {
            this.visible = visible===true;
        }

        public isVisible(): boolean {
            return this.visible;
        }

        public getColDef(): ColDef {
            return this.colDef;
        }

        public getColumnGroupShow(): string {
            return this.colDef.columnGroupShow;
        }

        public getColId(): string {
            return this.colId;
        }

        public getDefinition(): AbstractColDef {
            return this.colDef;
        }

        public getActualWidth(): number {
            return this.actualWidth;
        }

        public setActualWidth(actualWidth: number): void {
            this.actualWidth = actualWidth;
        }

        public isGreaterThanMax(width: number): boolean {
            if (this.colDef.maxWidth >= constants.MIN_COL_WIDTH) {
                return width > this.colDef.maxWidth;
            } else {
                return false;
            }
        }

        public getMinimumWidth(): number {
            return Math.max(this.colDef.minWidth, constants.MIN_COL_WIDTH);
        }

        public setMinimum(): void {
            this.actualWidth = this.getMinimumWidth();
        }
    }

}