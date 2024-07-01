import type { BeanCollection, IServerSideTransactionManager, NamedBean, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class TransactionManager extends BeanStub implements NamedBean, IServerSideTransactionManager {
    beanName: "ssrmTransactionManager";
    private valueCache;
    private serverSideRowModel;
    private selectionService;
    wireBeans(beans: BeanCollection): void;
    private asyncTransactionsTimeout;
    private asyncTransactions;
    postConstruct(): void;
    applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    private scheduleExecuteAsync;
    private executeAsyncTransactions;
    flushAsyncTransactions(): void;
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
}
