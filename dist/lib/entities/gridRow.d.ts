// Type definitions for ag-grid v5.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridCell } from "./gridCell";
import { Column } from "./column";
export declare class GridRow {
    floating: string;
    rowIndex: number;
    constructor(rowIndex: number, floating: string);
    isFloatingTop(): boolean;
    isFloatingBottom(): boolean;
    isNotFloating(): boolean;
    equals(otherSelection: GridRow): boolean;
    toString(): string;
    getGridCell(column: Column): GridCell;
    before(otherSelection: GridRow): boolean;
}
