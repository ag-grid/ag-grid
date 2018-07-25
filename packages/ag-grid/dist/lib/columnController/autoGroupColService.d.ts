// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
export declare class AutoGroupColService {
    static GROUP_AUTO_COLUMN_ID: string;
    static GROUP_AUTO_COLUMN_BUNDLE_ID: string;
    private gridOptionsWrapper;
    private context;
    private columnController;
    private balancedColumnTreeBuilder;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn(rowGroupCol?, index?);
    private generateDefaultColDef(rowGroupCol?);
}
