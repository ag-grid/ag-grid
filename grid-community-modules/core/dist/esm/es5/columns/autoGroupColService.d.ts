// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare const GROUP_AUTO_COLUMN_ID: 'ag-Grid-AutoColumn';
export declare class AutoGroupColService extends BeanStub {
    private columnModel;
    private columnFactory;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    updateAutoGroupColumns(autoGroupColumns: Column[]): void;
    private createOneAutoGroupColumn;
    /**
     * Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef
     */
    private updateOneAutoGroupColumn;
    private createAutoGroupColDef;
    private createBaseColDef;
}
