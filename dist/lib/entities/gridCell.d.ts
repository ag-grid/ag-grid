// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./column";
import { GridRow } from "./gridRow";
export interface GridCellDef {
    floating: string;
    rowIndex: number;
    column: Column;
}
export declare class GridCell {
    floating: string;
    rowIndex: number;
    column: Column;
    constructor(gridCellDef: GridCellDef);
    getGridCellDef(): GridCellDef;
    getGridRow(): GridRow;
    toString(): string;
    createId(): string;
}
