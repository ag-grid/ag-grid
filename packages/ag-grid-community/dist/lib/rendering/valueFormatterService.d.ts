import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
export declare class ValueFormatterService {
    private gridOptionsWrapper;
    private expressionService;
    formatValue(column: Column, rowNode: RowNode | null, $scope: any, value: any): string;
}
