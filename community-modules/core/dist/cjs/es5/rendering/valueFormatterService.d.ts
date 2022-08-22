// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
import { BeanStub } from "../context/beanStub";
export declare class ValueFormatterService extends BeanStub {
    private expressionService;
    formatValue(column: Column, node: RowNode | null, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string | null;
}
