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
