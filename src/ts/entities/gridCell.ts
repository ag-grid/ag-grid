import {Column} from "./column";
import {Utils as _} from "../utils";
import {GridRow} from "./gridRow";

export class GridCell {

    floating: string;
    rowIndex: number;
    column: Column;

    constructor(rowIndex: number, floating: string, column: Column) {
        this.rowIndex = rowIndex;
        this.column = column;
        this.floating = _.makeNull(floating);
    }

    public getGridRow(): GridRow {
        return new GridRow(this.rowIndex, this.floating);
    }

    public toString(): string {
        return `rowIndex = ${this.rowIndex}, floating = ${this.floating}, column = ${this.column ? this.column.getId() : null}`;
    }

    public createId(): string {
        return `${this.rowIndex}.${this.floating}.${this.column.getId()}`;
    }
}
