/** Datasource used by both PaginationController and VirtualPageRowModel */
export interface IDatasource {
    /** If you know up front how many rows are in the dataset, set it here. Otherwise leave blank.*/
    rowCount?: number;
    /** Callback the grid calls that you implement to fetech rows from the server. See below for params.*/
    getRows(params: IGetRowsParams): void;
}

/** Params for the above IDatasource.getRows() */
export interface IGetRowsParams {
    startRow: number;
    endRow: number;
    successCallback(rowsThisPage: any[], lastRow?: number): void;
    failCallback(): void;
    sortModel: any,
    filterModel: any,
    context: any
}
