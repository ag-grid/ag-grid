// we pass a VO of the column and not the column itself,
// so the data is read to be be converted to JSON and thrown
// over the wire
import {RowNode} from "../entities/rowNode";

export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}

export interface IEnterpriseGetRowsRequest {
    // columns that are currently row grouped
    startRow: number;
    // columns that are currently row grouped
    endRow: number;
    // columns that are currently row grouped
    rowGroupCols: ColumnVO[];
    // columns that have aggregations on them
    valueCols: ColumnVO[];
    // columns that have pivot on them
    pivotCols: ColumnVO[];
    // defines if pivot mode is on or off
    pivotMode: boolean;
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

    // the parent row node. is the RootNode (level -1) if request is top level.
    // this is NOT part fo the request as it cannot be serialised to JSON (a rowNode has methods)
    parentNode: RowNode;

    // success callback, pass the rows back the grid asked for
    successCallback(rowsThisPage: any[], lastRow: number): void;

    // fail callback, tell the grid the call failed so it can adjust it's state
    failCallback(): void;
}

// datasource for Enterprise Row Model
export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
    destroy?(): void;
}
