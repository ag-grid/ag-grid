/** Used by both PaginationController and VirtualPageRowModel */

export interface IDataSource {
    rowCount?: number;
    getRows(params: IGetRowsParams): void;
}

export interface IGetRowsParams {
    startRow: number;
    endRow: number;
    successCallback(rowsThisPage: any[], lastRow?: number): void;
    failCallback(): void;
    sortModel: any,
    filterModel: any,
    context: any
}