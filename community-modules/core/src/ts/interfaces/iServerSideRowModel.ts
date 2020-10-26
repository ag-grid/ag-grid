import {IRowModel} from "./iRowModel";
import {ServerSideTransaction, ServerSideTransactionResult} from "./serverSideTransaction";

export interface IServerSideRowModel extends IRowModel {
    refreshStore(params: RefreshStoreParams): void;
    onRowHeightChanged(): void;
}

export interface IServerSideTransactionManager {
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    flushAsyncTransactions(): void;
}

export interface RefreshStoreParams {
    route?: string[];
    showLoading?: boolean;
}
