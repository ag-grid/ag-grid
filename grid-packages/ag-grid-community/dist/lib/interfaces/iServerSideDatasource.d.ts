import { RowNode } from "../entities/rowNode";
import { ColumnVO } from "./iColumnVO";
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
import { LoadSuccessParams } from "../rowNodeCache/rowNodeBlock";
export interface IServerSideGetRowsRequest {
    /** First row requested or undefined for all rows. */
    startRow: number | undefined;
    /** Last row requested or undefined for all rows. */
    endRow: number | undefined;
    /** Columns that are currently row grouped.  */
    rowGroupCols: ColumnVO[];
    /** Columns that have aggregations on them.  */
    valueCols: ColumnVO[];
    /** Columns that have pivot on them.  */
    pivotCols: ColumnVO[];
    /** Defines if pivot mode is on or off.  */
    pivotMode: boolean;
    /** What groups the user is viewing.  */
    groupKeys: string[];
    /** If filtering, what the filter model is.  */
    filterModel: any;
    /** If sorting, what the sort model is.  */
    sortModel: any;
}
export interface IServerSideGetRowsParams {
    /**
     * Details for the request. A simple object that can be converted to JSON.
     */
    request: IServerSideGetRowsRequest;
    /**
     * The parent row node. The RootNode (level -1) if request is top level.
     * This is NOT part fo the request as it cannot be serialised to JSON (a rowNode has methods).
     */
    parentNode: RowNode;
    /**
     * @deprecated Use `success` method instead and return result as a `LoadSuccessParams` object.
     */
    successCallback(rowsThisPage: any[], lastRow: number): void;
    /**
     * Success callback, pass the rows back to the grid that were requested.
     */
    success(params: LoadSuccessParams): void;
    /**
     * @deprecated Use `fail` instead.
     */
    failCallback(): void;
    /**
     * Fail callback, tell the grid the call failed so it can adjust it's state.
     */
    fail(): void;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface IServerSideDatasource {
    /**
     * Grid calls `getRows` when it requires more rows as specified in the params.
     * Params object contains callbacks for responding to the request.
     */
    getRows(params: IServerSideGetRowsParams): void;
    /** Optional method, if your datasource has state it needs to clean up. */
    destroy?(): void;
}
