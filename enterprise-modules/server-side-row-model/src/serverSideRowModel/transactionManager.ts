import type {
    BeanCollection,
    IServerSideTransactionManager,
    NamedBean,
    ServerSideTransaction,
    ServerSideTransactionResult,
    ValueCache,
} from '@ag-grid-community/core';
import { BeanStub, ServerSideTransactionResultStatus } from '@ag-grid-community/core';

import type { ServerSideRowModel } from './serverSideRowModel';
import type { ServerSideSelectionService } from './services/serverSideSelectionService';

interface AsyncTransactionWrapper {
    transaction: ServerSideTransaction;
    callback?: (result: ServerSideTransactionResult) => void;
}

export class TransactionManager extends BeanStub implements NamedBean, IServerSideTransactionManager {
    beanName = 'ssrmTransactionManager' as const;

    private valueCache: ValueCache;
    private serverSideRowModel: ServerSideRowModel;
    private selectionService: ServerSideSelectionService;

    public wireBeans(beans: BeanCollection): void {
        this.valueCache = beans.valueCache;
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
        this.selectionService = beans.selectionService as ServerSideSelectionService;
    }

    private asyncTransactionsTimeout: number | undefined;
    private asyncTransactions: AsyncTransactionWrapper[] = [];

    public postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gos.isRowModelType('serverSide')) {
            return;
        }
    }

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
        const waitMillis = this.gos.getAsyncTransactionWaitMillis();
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

        this.asyncTransactions.forEach((txWrapper) => {
            let result: ServerSideTransactionResult | undefined;
            const hasStarted = this.serverSideRowModel.executeOnStore(txWrapper.transaction.route!, (cache) => {
                result = cache.applyTransaction(txWrapper.transaction);
            });

            if (!hasStarted) {
                result = { status: ServerSideTransactionResultStatus.StoreNotStarted };
            } else if (result == undefined) {
                result = { status: ServerSideTransactionResultStatus.StoreNotFound };
            }

            resultsForEvent.push(result);

            const retryTransaction = result.status == ServerSideTransactionResultStatus.StoreLoading;

            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }

            if (txWrapper.callback) {
                resultFuncs.push(() => txWrapper.callback!(result!));
            }
            if (result.status === ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        });

        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(() => {
                resultFuncs.forEach((func) => func());
            }, 0);
        }

        this.asyncTransactionsTimeout = undefined;

        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;

        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent<'storeUpdated'>({ type: 'storeUpdated' });
        }

        if (resultsForEvent.length > 0) {
            this.eventService.dispatchEvent<'asyncTransactionsFlushed'>({
                type: 'asyncTransactionsFlushed',
                results: resultsForEvent,
            });
        }
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
            this.valueCache.onDataChanged();
            if (res.remove) {
                const removedRowIds = res.remove.map((row) => row.id!);
                this.selectionService.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
            }

            this.eventService.dispatchEvent<'storeUpdated'>({ type: 'storeUpdated' });
            return res;
        } else {
            return { status: ServerSideTransactionResultStatus.StoreNotFound };
        }
    }
}
