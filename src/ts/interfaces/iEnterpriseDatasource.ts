// we pass a VO of the column and not the column itself,
// so the data is read to be be converted to JSON and thrown
// over the wire
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}

export interface IEnterpriseGetRowsRequest {
    // columns that are currently row grouped
    rowGroupCols: ColumnVO[];
    // columns that have aggregations on them
    valueCols: ColumnVO[];
    // what groups the user is viewing
    groupKeys: string[];
    // if filtering, what the filter model is
    filterModel: any;
    // if sorting, what the sort model is
    sortModel: any;
}

export interface IEnterpriseGetRowsParams {

    // details for the request,
    request: IEnterpriseGetRowsRequest;

    // success callback, pass the rows back the grid asked for
    successCallback(rowsThisPage: any[]): void;

    // fail callback, tell the grid the call failed so it can adjust it's state
    failCallback(): void;
}

// datasource for Enterprise Row Model
export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
}