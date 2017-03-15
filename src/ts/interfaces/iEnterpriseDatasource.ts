export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}

export interface IEnterpriseGetRowsRequest {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    groupKeys: string[];
    filterModel: any;
    sortModel: any;
}

export interface IEnterpriseGetRowsParams {
    // startRow: number;
    // endRow: number;

    successCallback(rowsThisPage: any[]): void;

    failCallback(): void;

    request: IEnterpriseGetRowsRequest;
}

export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
}