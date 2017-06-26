// Type definitions for ag-grid v11.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColDef } from "./entities/colDef";
import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
export declare class ValueService {
    private gridOptionsWrapper;
    private expressionService;
    private columnController;
    private eventService;
    private groupValueService;
    private cellExpressions;
    private initialised;
    init(): void;
    getValue(column: Column, rowNode: RowNode, ignoreAggData?: boolean): any;
    setValue(rowNode: RowNode, colKey: string | ColDef | Column, newValue: any): void;
    private setValueUsingField(data, field, newValue, isFieldContainsDots);
    private executeValueGetter(valueGetter, data, column, node);
    private getValueCallback(node, field);
}
