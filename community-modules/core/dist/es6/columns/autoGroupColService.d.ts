// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class AutoGroupColService extends BeanStub {
    static GROUP_AUTO_COLUMN_BUNDLE_ID: string;
    private columnModel;
    private columnFactory;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn;
    private generateDefaultColDef;
}
