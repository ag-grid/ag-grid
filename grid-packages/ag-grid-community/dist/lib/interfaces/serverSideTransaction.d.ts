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
