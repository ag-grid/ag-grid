import {IRowModel} from "./iRowModel";
import {ServerSideTransaction, ServerSideTransactionResult} from "./serverSideTransaction";
import {ServerSideStoreState} from "./IServerSideStore";

export interface IServerSideRowModel extends IRowModel {
    refreshStore(params: RefreshStoreParams): void;
    onRowHeightChanged(): void;
    getStoreState(): ServerSideStoreState[];
    retryLoads(): void;
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
