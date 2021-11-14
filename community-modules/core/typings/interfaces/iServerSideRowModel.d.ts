import { IRowModel } from "./iRowModel";
import { ServerSideTransaction, ServerSideTransactionResult } from "./serverSideTransaction";
import { ServerSideStoreState } from "./IServerSideStore";
import { IServerSideDatasource } from "./iServerSideDatasource";
import { RowNode } from "../entities/rowNode";
export interface IServerSideRowModel extends IRowModel {
    refreshStore(params: RefreshStoreParams): void;
    onRowHeightChanged(): void;
    getStoreState(): ServerSideStoreState[];
    retryLoads(): void;
    expandAll(value: boolean): void;
    setDatasource(datasource: IServerSideDatasource): void;
    forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void;
}
export interface IServerSideTransactionManager {
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    flushAsyncTransactions(): void;
}
export interface RefreshStoreParams {
    /**
     * List of group keys, pointing to the store to refresh.
     * For example, to purge the cache two levels down under 'Canada'and then '2002', pass in the string array ['Canada','2002'].
     * If no route is passed, or an empty array, then the top level store is refreshed.
     */
    route?: string[];
    /**
     * If true, then all rows at the level getting refreshed are immediately destroyed and 'loading' rows will appear.
     * If false, then all rows at the level getting refreshed are kept until rows are loaded (no 'loading' rows appear).
     */
    purge?: boolean;
}
