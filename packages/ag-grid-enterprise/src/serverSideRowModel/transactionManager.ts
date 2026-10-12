import type {
    BeanCollection,
    IServerSideTransactionManager,
    NamedBean,
    ServerSideTransaction,
    ServerSideTransactionResult,
    ValueCache,
} from 'ag-grid-community';
import { BeanStub, ServerSideTransactionResultStatus } from 'ag-grid-community';

import type { ServerSideRowModel } from './serverSideRowModel';
import type { ServerSideSelectionService } from './services/serverSideSelectionService';
import type { LazyStore } from './stores/lazy/lazyStore';
import type { TransactionMergeService } from './transactionMergeService';

interface AsyncTransactionWrapper {
    transaction: ServerSideTransaction;
    callback?: (result: ServerSideTransactionResult) => void;
}

export class TransactionManager extends BeanStub implements NamedBean, IServerSideTransactionManager {
    beanName = 'ssrmTxnManager' as const;

    private valueCache?: ValueCache;
    private serverSideRowModel: ServerSideRowModel;
    private selectionSvc?: ServerSideSelectionService;
    private txnMerger?: TransactionMergeService;

    public wireBeans(beans: BeanCollection): void {
        this.valueCache = beans.valueCache;
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
        this.selectionSvc = beans.selectionSvc as ServerSideSelectionService;
        this.txnMerger = beans.ssrmTxnMerger as TransactionMergeService | undefined;
    }

    private asyncTransactionsTimeout: number | undefined;
    private asyncTransactions: AsyncTransactionWrapper[] = [];

    public applyTransactionAsync(
        transaction: ServerSideTransaction,
        callback?: (res: ServerSideTransactionResult) => void
    ): void {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    }

    private scheduleExecuteAsync(): void {
        const waitMillis = this.gos.get('asyncTransactionWaitMillis');
        this.asyncTransactionsTimeout = window.setTimeout(() => {
            this.executeAsyncTransactions();
        }, waitMillis);
    }

    private executeAsyncTransactions(): void {
        if (!this.asyncTransactions) {
            return;
        }

        const resultFuncs: (() => void)[] = [];
        const resultsForEvent: ServerSideTransactionResult[] = [];

        const transactionsToRetry: AsyncTransactionWrapper[] = [];
        let atLeastOneTransactionApplied = false;

        const queued = this.asyncTransactions;
        const mergedResults = this.txnMerger?.applyTransactions(
            queued.map((txWrapper) => txWrapper.transaction),
            (route, count, apply) => this.applyOnStore(route, count, apply)
        );

        // the queue can grow while it is applied, and transactions added late are applied on their own
        for (let i = 0; i < queued.length; ++i) {
            const txWrapper = queued[i];
            const result = mergedResults?.[i] ?? this.applyTransactionOnStore(txWrapper.transaction);

            resultsForEvent.push(result);

            const retryTransaction = result.status == ServerSideTransactionResultStatus.StoreLoading;

            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                continue;
            }

            if (txWrapper.callback) {
                resultFuncs.push(() => txWrapper.callback!(result));
            }
            if (result.status === ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        }

        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(() => {
                for (const func of resultFuncs) {
                    func();
                }
            }, 0);
        }

        this.asyncTransactionsTimeout = undefined;

        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;

        if (atLeastOneTransactionApplied) {
            this.valueCache?.onDataChanged();
            this.eventSvc.dispatchEvent({ type: 'storeUpdated' });
        }

        if (resultsForEvent.length > 0) {
            this.eventSvc.dispatchEvent({
                type: 'asyncTransactionsFlushed',
                results: resultsForEvent,
            });
        }
    }

    private applyTransactionOnStore(transaction: ServerSideTransaction): ServerSideTransactionResult {
        return this.applyOnStore(transaction.route, 1, (store) => [store.applyTransaction(transaction)])[0];
    }

    /** @returns `count` results, from `apply` when the store exists */
    private applyOnStore(
        route: string[] | undefined,
        count: number,
        apply: (store: LazyStore) => ServerSideTransactionResult[]
    ): ServerSideTransactionResult[] {
        let results: ServerSideTransactionResult[] | undefined;
        const hasStarted = this.serverSideRowModel.executeOnStore(route!, (store) => {
            results = apply(store);
        });
        if (results) {
            return results;
        }
        const status = hasStarted
            ? ServerSideTransactionResultStatus.StoreNotFound
            : ServerSideTransactionResultStatus.StoreNotStarted;
        return Array.from({ length: count }, () => ({ status }));
    }

    public flushAsyncTransactions(): void {
        // the timeout could be missing, if we are flushing due to row data loaded
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
        }
        this.executeAsyncTransactions();
    }

    public applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined {
        let res: ServerSideTransactionResult | undefined;

        const hasStarted = this.serverSideRowModel.executeOnStore(transaction.route!, (store) => {
            res = store.applyTransaction(transaction);
        });

        if (!hasStarted) {
            return { status: ServerSideTransactionResultStatus.StoreNotStarted };
        } else if (res) {
            this.valueCache?.onDataChanged();
            if (res.remove && this.selectionSvc) {
                const removedRowIds = res.remove.map((row) => row.id!);
                this.selectionSvc.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
            }

            this.eventSvc.dispatchEvent({ type: 'storeUpdated' });
            return res;
        } else {
            return { status: ServerSideTransactionResultStatus.StoreNotFound };
        }
    }
}
