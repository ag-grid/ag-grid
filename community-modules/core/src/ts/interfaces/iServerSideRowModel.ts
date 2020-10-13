import { IRowModel } from "./iRowModel";
import {RowDataTransaction} from "./rowDataTransaction";
import {ServerSideTransaction, ServerSideTransactionResult} from "./serverSideTransaction";

export interface IServerSideRowModel extends IRowModel {
    purgeStore(route?: string[]): void;
    onRowHeightChanged(): void;
}

export interface IServerSideTransactionManager {
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    flushAsyncTransactions(): void;
}
