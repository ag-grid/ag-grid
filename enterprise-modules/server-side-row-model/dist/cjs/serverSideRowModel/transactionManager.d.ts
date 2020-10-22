import { BeanStub, IServerSideTransactionManager, ServerSideTransaction, ServerSideTransactionResult } from "@ag-grid-community/core";
export declare class TransactionManager extends BeanStub implements IServerSideTransactionManager {
    private rowNodeBlockLoader;
    private gridOptionsWrapper;
    private valueCache;
    private serverSideRowModel;
    private asyncTransactionsTimeout;
    private asyncTransactions;
    private loadingStrategy;
    private postConstruct;
    private setupLoadingStrategy;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    private scheduleExecuteAsync;
    private executeAsyncTransactions;
    flushAsyncTransactions(): void;
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
}
