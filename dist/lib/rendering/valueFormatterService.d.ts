// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
export declare class ValueFormatterService {
    private gridOptionsWrapper;
    private expressionService;
    formatValue(column: Column, rowNode: RowNode, $scope: any, value: any): string;
}
