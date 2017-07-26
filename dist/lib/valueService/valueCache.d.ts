// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
export declare class ValueCache {
    private gridOptionsWrapper;
    private cacheVersion;
    private active;
    private neverExpires;
    init(): void;
    onDataChanged(): void;
    expire(): void;
    setValue(rowNode: RowNode, colId: string, value: any): any;
    getValue(rowNode: RowNode, colId: string): any;
}
