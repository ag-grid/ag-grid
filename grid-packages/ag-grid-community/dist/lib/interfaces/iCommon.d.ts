import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
/**
 * Enables types safe create of the given type without the need to set the common grid properties
 * that will be merged with the object in a centralised location.
 */
export declare type WithoutGridCommon<T extends AgGridCommon<any>> = Omit<T, keyof AgGridCommon<any>>;
export interface AgGridCommon<TData> {
    /** The grid api. */
    api: GridApi<TData>;
    /** The column api. */
    columnApi: ColumnApi;
    /** Application context as set on `gridOptions.context`. */
    context: any;
}
