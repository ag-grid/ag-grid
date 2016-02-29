import Column from "./column";
import Constants from "../constants";

export class GridCell {

    floating: string;
    rowIndex: number;
    column: Column;

    constructor(rowIndex: number, floating: string, column: Column) {
        this.rowIndex = rowIndex;
        this.floating = floating;
        this.column = column;
    }

    public getGridRow(): GridRow {
        return new GridRow(this.rowIndex, this.floating);
    }
}

export class GridRow {

    floating: string;
    rowIndex: number;

    constructor(rowIndex: number, floating: string) {
        this.rowIndex = rowIndex;
        this.floating = floating;
    }

    isFloatingTop(): boolean {
        return this.floating === Constants.FLOATING_TOP;
    }

    isFloatingBottom(): boolean {
        return this.floating === Constants.FLOATING_BOTTOM;
    }

    isNotFloating(): boolean {
        return !this.isFloatingBottom() && !this.isFloatingTop();
    }
}
