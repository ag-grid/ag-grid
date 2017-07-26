// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export declare class AutoGroupColService {
    static GROUP_AUTO_COLUMN_ID: string;
    static GROUP_AUTO_COLUMN_BUNDLE_ID: string;
    private gridOptionsWrapper;
    private context;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn(rowGroupCol?, index?);
    private generateDefaultColDef(rowGroupCol?, index?);
}
