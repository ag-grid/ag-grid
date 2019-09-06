// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
