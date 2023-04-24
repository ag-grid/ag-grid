import { ColDef, ColGroupDef } from "../entities/colDef";
import { Column } from "../entities/column";
export declare class ColumnDefFactory {
    buildColumnDefs(cols: Column[], rowGroupColumns: Column[], pivotColumns: Column[]): (ColDef | ColGroupDef)[];
    private createDefFromGroup;
    private createDefFromColumn;
}
