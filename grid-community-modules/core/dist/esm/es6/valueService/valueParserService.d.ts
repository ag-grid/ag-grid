// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from '../context/beanStub';
import { Column } from '../entities/column';
import { IRowNode } from '../interfaces/iRowNode';
export declare class ValueParserService extends BeanStub {
    private expressionService;
    parseValue(column: Column, rowNode: IRowNode | null, newValue: any, oldValue: any): any;
}
