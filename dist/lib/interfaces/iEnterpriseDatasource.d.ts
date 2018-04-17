// Type definitions for ag-grid v17.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}
export interface IEnterpriseGetRowsRequest {
    startRow: number;
    endRow: number;
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    groupKeys: string[];
    filterModel: any;
    sortModel: any;
}
export interface IEnterpriseGetRowsParams {
    request: IEnterpriseGetRowsRequest;
    parentNode: RowNode;
    successCallback(rowsThisPage: any[], lastRow: number): void;
    failCallback(): void;
}
export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
    destroy?(): void;
}
