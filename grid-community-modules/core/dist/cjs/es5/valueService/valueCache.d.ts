// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
import { BeanStub } from "../context/beanStub";
export declare class ValueCache extends BeanStub {
    private cacheVersion;
    private active;
    private neverExpires;
    init(): void;
    onDataChanged(): void;
    expire(): void;
    setValue(rowNode: RowNode, colId: string, value: any): any;
    getValue(rowNode: RowNode, colId: string): any;
}
