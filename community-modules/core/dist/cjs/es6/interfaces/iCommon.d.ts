// Type definitions for @ag-grid-community/core v27.3.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
/**
 * Enables types safe create of the given type without the need to set the common grid properties
 * that will be merged with the object in a centralised location.
 */
export declare type WithoutGridCommon<T extends AgGridCommon> = Omit<T, keyof AgGridCommon>;
export interface AgGridCommon {
    /** The grid api. */
    api: GridApi;
    /** The column api. */
    columnApi: ColumnApi;
    /** Application context as set on `gridOptions.context`. */
    context: any;
}
