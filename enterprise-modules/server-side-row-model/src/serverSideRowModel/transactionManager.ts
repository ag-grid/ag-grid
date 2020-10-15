import {
    Autowired,
    Bean,
    BeanStub,
    Events,
    GridOptionsWrapper,
    IServerSideTransactionManager,
    PostConstruct,
    RowNodeBlockLoader,
    ServerSideTransaction,
    ServerSideTransactionResult,
    ServerSideTransactionResultStatus,
    ValueCache,
    AsyncTransactionsApplied,
    _
} from "@ag-grid-community/core";
import {ServerSideRowModel} from "./serverSideRowModel";

interface AsyncTransactionWrapper {
    transaction: ServerSideTransaction;
    callback?: (result: ServerSideTransactionResult) => void;
}

enum LoadingStrategy {
    ApplyAfterLoaded = 'applyAfterLoaded',
    DoNotApply = 'doNotApply'
}

@Bean('serverSideTransactionManager')
export class TransactionManager extends BeanStub implements IServerSideTransactionManager {

    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;

    private asyncTransactionsTimeout: number;
    private asyncTransactions: AsyncTransactionWrapper[];

    private loadingStrategy: LoadingStrategy;

    @PostConstruct
    private addEventListeners(): void {
        this.setupLoadingStrategy();
    }

    private setupLoadingStrategy(): void {
        const loadingStrategy = this.gridOptionsWrapper.getServerSideAsyncTransactionLoadingStrategy();

        // default is 'Skip'
        if (loadingStrategy == null) {
            this.loadingStrategy = LoadingStrategy.DoNotApply;
            return;
        }

        switch (loadingStrategy) {
            case LoadingStrategy.ApplyAfterLoaded:
            case LoadingStrategy.DoNotApply:
                this.loadingStrategy = loadingStrategy;
                break;
            default:
                const strategies = Object.keys(LoadingStrategy).join(', ')
                console.warn(`ag-Grid: Invalid loading strategy: ${loadingStrategy}, should be one of [${strategies}]`);
                this.loadingStrategy = LoadingStrategy.DoNotApply;
                break;
        }
    }

    public applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void {
        if (this.asyncTransactionsTimeout == null) {
            this.asyncTransactions = [];
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    }

    private scheduleExecuteAsync(): void {
        const waitMillis = this.gridOptionsWrapper.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(() => {
            this.executeAsyncTransactions();
        }, waitMillis);
    }

    private executeAsyncTransactions(): void {

        const resultFuncs: (() => void)[] = [];
        const resultsForEvent: ServerSideTransactionResult[] = [];

        const transactionsToRetry: AsyncTransactionWrapper[] = [];
        let atLeastOneTransactionApplied = false;

        this.asyncTransactions.forEach(txWrapper => {
            let result: ServerSideTransactionResult;
            this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, cache => {
                result = cache.applyTransaction(txWrapper.transaction);
            });

            if (result == undefined) {
                result = {status: ServerSideTransactionResultStatus.StoreNotFound};
            }

            resultsForEvent.push(result);

            const retryTransaction = result.status == ServerSideTransactionResultStatus.StoreLoading && this.loadingStrategy == LoadingStrategy.ApplyAfterLoaded;
            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }

            if (txWrapper.callback) {
                resultFuncs.push(() => txWrapper.callback(result));
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

        if (transactionsToRetry.length > 0) {
            this.scheduleExecuteAsync();
            this.asyncTransactions = transactionsToRetry;
        } else {
            this.asyncTransactions = null;
            this.asyncTransactionsTimeout = undefined;
        }

        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({type: Events.EVENT_STORE_UPDATED});
        }

        if (resultsForEvent.length > 0) {
            const event: AsyncTransactionsApplied = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                type: Events.EVENT_ASYNC_TRANSACTIONS_APPLIED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public flushAsyncTransactions(): void {
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
            this.executeAsyncTransactions();
        }
    }

    public applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult {
        let res: ServerSideTransactionResult;

        this.serverSideRowModel.executeOnStore(transaction.route, cache => {
            res = cache.applyTransaction(transaction);
        });

        if (res) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({type: Events.EVENT_STORE_UPDATED});
        } else {
            return {status: ServerSideTransactionResultStatus.StoreNotFound};
        }
    }
}