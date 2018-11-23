// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
export declare class AutoGroupColService {
    static GROUP_AUTO_COLUMN_ID: string;
    static GROUP_AUTO_COLUMN_BUNDLE_ID: string;
    private gridOptionsWrapper;
    private context;
    private columnController;
    private columnFactory;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn;
    private generateDefaultColDef;
}
//# sourceMappingURL=autoGroupColService.d.ts.map