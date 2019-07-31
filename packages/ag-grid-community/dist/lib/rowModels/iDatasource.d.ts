// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
/** Datasource used by both PaginationController and InfiniteRowModel */
export interface IDatasource {
    /** If you know up front how many rows are in the dataset, set it here. Otherwise leave blank.*/
    rowCount?: number;
    /** Callback the grid calls that you implement to fetch rows from the server. See below for params.*/
    getRows(params: IGetRowsParams): void;
    destroy?(): void;
}
/** Params for the above IDatasource.getRows() */
export interface IGetRowsParams {
    /** The first row index to get. */
    startRow: number;
    /** The first row index to NOT get. */
    endRow: number;
    /** Callback to call for the result when successful. */
    successCallback(rowsThisBlock: any[], lastRow?: number): void;
    /** Callback to call when the request fails. */
    failCallback(): void;
    /** If doing server side sorting, contains the sort model */
    sortModel: any;
    /** If doing server side filtering, contains the filter model */
    filterModel: any;
    /** The grid context object */
    context: any;
}
