import { IRowModel } from "./iRowModel";
import { ServerSideTransaction, ServerSideTransactionResult } from "./serverSideTransaction";
import { ServerSideStoreState } from "./IServerSideStore";
import { IServerSideDatasource } from "./iServerSideDatasource";
export interface IServerSideRowModel extends IRowModel {
    refreshStore(params: RefreshStoreParams): void;
    onRowHeightChanged(): void;
    getStoreState(): ServerSideStoreState[];
    retryLoads(): void;
    expandAll(value: boolean): void;
    setDatasource(datasource: IServerSideDatasource): void;
}
export interface IServerSideTransactionManager {
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    flushAsyncTransactions(): void;
}
export interface RefreshStoreParams {
    route?: string[];
    purge?: boolean;
}
