import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
export declare class ValueFormatterService {
    private gridOptionsWrapper;
    private expressionService;
    formatValue(column: Column, node: RowNode | null, $scope: any, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string;
}
