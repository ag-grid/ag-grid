// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef, ColGroupDef } from "../entities/colDef";
import { Column } from "../entities/column";
export declare class ColumnDefFactory {
    buildColumnDefs(cols: Column[], rowGroupColumns: Column[], pivotColumns: Column[]): (ColDef | ColGroupDef)[];
    private createDefFromGroup;
    private createDefFromColumn;
}
