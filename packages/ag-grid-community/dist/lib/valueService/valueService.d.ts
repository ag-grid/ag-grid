// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export declare class ValueService {
    private gridOptionsWrapper;
    private expressionService;
    private columnController;
    private eventService;
    private valueCache;
    private cellExpressions;
    private initialised;
    init(): void;
    getValue(column: Column, rowNode?: RowNode | null, forFilter?: boolean, ignoreAggData?: boolean): any;
    setValue(rowNode: RowNode, colKey: string | Column, newValue: any): void;
    private setValueUsingField;
    private executeFilterValueGetter;
    private executeValueGetter;
    private getValueCallback;
    getKeyForNode(col: Column, rowNode: RowNode): any;
}
