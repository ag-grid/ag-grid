import type { BeanCollection, IServerSideGroupSelectionState, IServerSideSelectionState, LoadSuccessParams, RefreshServerSideParams, ServerSideGroupLevelState, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
export declare function getServerSideSelectionState(beans: BeanCollection): IServerSideSelectionState | IServerSideGroupSelectionState | null;
export declare function setServerSideSelectionState(beans: BeanCollection, state: IServerSideSelectionState | IServerSideGroupSelectionState): void;
export declare function applyServerSideTransaction(beans: BeanCollection, transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
export declare function applyServerSideRowData(beans: BeanCollection, params: {
    successParams: LoadSuccessParams;
    route?: string[];
    startRow?: number;
}): void;
export declare function applyServerSideTransactionAsync(beans: BeanCollection, transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
export declare function retryServerSideLoads(beans: BeanCollection): void;
export declare function flushServerSideAsyncTransactions(beans: BeanCollection): void;
export declare function refreshServerSide(beans: BeanCollection, params?: RefreshServerSideParams): void;
export declare function getServerSideGroupLevelState(beans: BeanCollection): ServerSideGroupLevelState[];
