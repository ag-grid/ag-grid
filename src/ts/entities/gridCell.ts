import {Column} from "./column";
import {Utils as _} from "../utils";
import {GridRow} from "./gridRow";

// this is what gets pass into and out of the api, as JavaScript users
export interface GridCellDef {
    floating: string;
    rowIndex: number;
    column: Column;
}

export class GridCell {

    floating: string;
    rowIndex: number;
    column: Column;

    constructor(gridCellDef: GridCellDef) {
        this.rowIndex = gridCellDef.rowIndex;
        this.column = gridCellDef.column;
        this.floating = _.makeNull(gridCellDef.floating);
    }

    public getGridCellDef(): GridCellDef {
        return {
            rowIndex: this.rowIndex,
            column: this.column,
            floating: this.floating
        }
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
