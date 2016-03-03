import {Column} from "./column";
import {Constants} from "../constants";
import {Utils as _} from '../utils';

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

export class GridRow {

    floating: string;
    rowIndex: number;

    constructor(rowIndex: number, floating: string) {
        this.rowIndex = rowIndex;
        this.floating = _.makeNull(floating);
    }

    public isFloatingTop(): boolean {
        return this.floating === Constants.FLOATING_TOP;
    }

    public isFloatingBottom(): boolean {
        return this.floating === Constants.FLOATING_BOTTOM;
    }

    public isNotFloating(): boolean {
        return !this.isFloatingBottom() && !this.isFloatingTop();
    }

    public equals(otherSelection: GridRow): boolean {
        return this.rowIndex === otherSelection.rowIndex
            && this.floating === otherSelection.floating;
    }

    // tests if this row selection is before the other row selection
    public before(otherSelection: GridRow): boolean {
        var otherFloating = otherSelection.floating;
        switch (this.floating) {
            case Constants.FLOATING_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (otherFloating!==Constants.FLOATING_TOP) { return true; }
                break;
            case Constants.FLOATING_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (otherFloating!==Constants.FLOATING_BOTTOM) { return false; }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (_.exists(otherFloating)) {
                    if (otherFloating===Constants.FLOATING_TOP) {
                        // we are not floating, other is floating top, we are first
                        return false;
                    } else {
                        // we are not floating, other is floating bottom, we are always first
                        return true;
                    }
                }
                break;
        }
        return this.rowIndex <= otherSelection.rowIndex;
    }
}
