import { IRowModel } from "./iRowModel";
import {RowDataTransaction} from "./rowDataTransaction";
import {ServerSideTransaction, ServerSideTransactionResult} from "./serverSideTransaction";

export interface IServerSideRowModel extends IRowModel {
    purgeStore(route?: string[]): void;
    onRowHeightChanged(): void;
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult;
}
