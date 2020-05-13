// Type definitions for @ag-grid-community/core v23.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
export declare class ValueFormatterService {
    private gridOptionsWrapper;
    private expressionService;
    formatValue(column: Column, node: RowNode | null, $scope: any, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string;
}
