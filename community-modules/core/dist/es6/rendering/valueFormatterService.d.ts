// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
import { BeanStub } from "../context/beanStub";
export declare class ValueFormatterService extends BeanStub {
    private gridOptionsWrapper;
    private expressionService;
    formatValue(column: Column, node: RowNode | null, $scope: any, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string;
}
