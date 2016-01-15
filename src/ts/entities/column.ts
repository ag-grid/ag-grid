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

        private actualWidth: any;
        private colId: any;

        colDef: ColDef;
        visible: any;
        pinned: string;
        index: number;
        aggFunc: string;
        pivotIndex: number;
        sort: string;
        sortedAt: number;

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
            if (this.colDef.minWidth > constants.MIN_COL_WIDTH) {
                return this.colDef.minWidth;
            } else {
                return constants.MIN_COL_WIDTH;
            }
        }

        public setMinimum(): void {
            this.actualWidth = this.getMinimumWidth();
        }
    }

}