// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export declare class AutoGroupColService {
    static GROUP_AUTO_COLUMN_ID: string;
    private gridOptionsWrapper;
    private context;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn(rowGroupCol?, index?);
}
