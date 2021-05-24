// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export interface ServerSideTransaction {
    route?: string[];
    addIndex?: number;
    add?: any[];
    remove?: any[];
    update?: any[];
}
export interface ServerSideTransactionResult {
    status: ServerSideTransactionResultStatus;
    add?: RowNode[];
    remove?: RowNode[];
    update?: RowNode[];
}
export declare enum ServerSideTransactionResultStatus {
    StoreNotFound = "StoreNotFound",
    StoreLoading = "StoreLoading",
    StoreWaitingToLoad = "StoreWaitingToLoad",
    StoreLoadingFailed = "StoreLoadingFailed",
    StoreWrongType = "StoreWrongType",
    Applied = "Applied",
    Cancelled = "Cancelled"
}
