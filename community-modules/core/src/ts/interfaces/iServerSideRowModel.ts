import { IRowModel } from "./iRowModel";
import { ServerSideTransaction, ServerSideTransactionResult } from "./serverSideTransaction";

export interface IServerSideRowModel extends IRowModel {
    purgeStore(route?: string[]): void;
    onRowHeightChanged(): void;
}

export interface IServerSideTransactionManager {
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    flushAsyncTransactions(): void;
}
