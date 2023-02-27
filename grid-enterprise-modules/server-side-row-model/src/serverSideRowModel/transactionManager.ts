import {
    Autowired,
    Bean,
    BeanStub,
    Events,
    IServerSideTransactionManager,
    PostConstruct,
    RowNodeBlockLoader,
    ServerSideTransaction,
    ServerSideTransactionResult,
    ServerSideTransactionResultStatus,
    ValueCache,
    AsyncTransactionsFlushed,
    RowRenderer,
    WithoutGridCommon,
    RowNode
} from "@ag-grid-community/core";
import { ServerSideRowModel } from "./serverSideRowModel";

interface AsyncTransactionWrapper {
    transaction: ServerSideTransaction;
    callback?: (result: ServerSideTransactionResult) => void;
}

@Bean('ssrmTransactionManager')
export class TransactionManager extends BeanStub implements IServerSideTransactionManager {

    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    private asyncTransactionsTimeout: number | undefined;
    private asyncTransactions: AsyncTransactionWrapper[] = [];

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) { return; }
    }

    public applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    }

    private scheduleExecuteAsync(): void {
        const waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(() => {
            this.executeAsyncTransactions();
        }, waitMillis);
    }

    private executeAsyncTransactions(): void {
        if (!this.asyncTransactions) { return; }

        const resultFuncs: (() => void)[] = [];
        const resultsForEvent: ServerSideTransactionResult[] = [];

        const transactionsToRetry: AsyncTransactionWrapper[] = [];
        let atLeastOneTransactionApplied = false;

        this.asyncTransactions.forEach(txWrapper => {
            let result: ServerSideTransactionResult | undefined;
            this.serverSideRowModel.executeOnStore(txWrapper.transaction.route!, cache => {
                result = cache.applyTransaction(txWrapper.transaction);
            });

            if (result == undefined) {
                result = {status: ServerSideTransactionResultStatus.StoreNotFound};
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
                resultFuncs.forEach(func => func());
            }, 0);
        }

        this.asyncTransactionsTimeout = undefined;

        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;

        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({type: Events.EVENT_STORE_UPDATED});
        }

        if (resultsForEvent.length > 0) {
            const event: WithoutGridCommon<AsyncTransactionsFlushed> = {                
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event);
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

        this.serverSideRowModel.executeOnStore(transaction.route!, store => {
            res = store.applyTransaction(transaction);
        });

        if (res) {
            this.valueCache.onDataChanged();

            this.eventService.dispatchEvent({type: Events.EVENT_STORE_UPDATED});
            if (res.update && res.update.length) {
                // this set timeout is necessary to queue behind the listener for EVENT_STORE_UPDATED in ssrm which recalculates the rowIndexes
                // if the rowIndex isn't calculated first the binarySearchForDisplayIndex will not be able to find the required rows
                setTimeout(() => {
                    // refresh the full width rows
                    this.rowRenderer.refreshFullWidthRows(res!.update as RowNode[]);
                }, 0);
            }

            return res;
        } else {
            return { status: ServerSideTransactionResultStatus.StoreNotFound };
        }
    }
}