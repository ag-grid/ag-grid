import { BeanStub, IServerSideTransactionManager, ServerSideTransaction, ServerSideTransactionResult } from "ag-grid-community";
export declare class TransactionManager extends BeanStub implements IServerSideTransactionManager {
    private rowNodeBlockLoader;
    private valueCache;
    private serverSideRowModel;
    private rowRenderer;
    private selectionService;
    private asyncTransactionsTimeout;
    private asyncTransactions;
    private postConstruct;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    private scheduleExecuteAsync;
    private executeAsyncTransactions;
    flushAsyncTransactions(): void;
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
}
