import { RowNode } from "../entities/rowNode";
import { ColumnVO } from "./iColumnVO";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
export interface IServerSideGetRowsRequest {
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
export interface IServerSideGetRowsParams {
    request: IServerSideGetRowsRequest;
    parentNode: RowNode;
    successCallback(rowsThisPage: any[], lastRow: number): void;
    failCallback(): void;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface IServerSideDatasource {
    getRows(params: IServerSideGetRowsParams): void;
    destroy?(): void;
}
