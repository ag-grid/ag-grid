// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
export declare class ValueService {
    private gridOptionsWrapper;
    private expressionService;
    private columnController;
    private eventService;
    private suppressDotNotation;
    init(): void;
    getValue(column: Column, node: RowNode): any;
    getValueUsingSpecificData(column: Column, data: any, node: any): any;
    private getValueUsingField(data, field);
    setValue(rowNode: RowNode, column: Column, newValue: any): void;
    private setValueUsingField(data, field, newValue);
    private executeValueGetter(valueGetter, data, column, node);
    private getValueCallback(data, node, field);
}
