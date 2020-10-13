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
    ValueCache
} from "@ag-grid-community/core";
import {ServerSideRowModel} from "./serverSideRowModel";

interface AsyncTransactionWrapper {
    transaction: ServerSideTransaction;
    callback?: (result: ServerSideTransactionResult) => void;
}

@Bean('serverSideTransactionManager')
export class TransactionManager extends BeanStub implements IServerSideTransactionManager {

    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;

    private asyncTransactionsTimeout: number;
    private asyncTransactions: AsyncTransactionWrapper[];

    @PostConstruct
    private addEventListeners(): void {
        this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader.BLOCK_LOADER_FINISHED_EVENT, this.onBlockLoaderFinished.bind(this));
    }

    public applyTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void {
        if (this.asyncTransactionsTimeout==null) {
            this.asyncTransactions = [];
            const waitMillis = this.gridOptionsWrapper.getAsyncTransactionWaitMillis();
            this.asyncTransactionsTimeout = window.setTimeout(() => {
                this.executeAsyncTransactions();
            }, waitMillis);
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    }

    private onBlockLoaderFinished(): void {

    }

    private executeAsyncTransactions(): void {

        const resultFuncs: (()=>void)[] = [];

        this.asyncTransactions.forEach(txWrapper => {
            this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, cache => {
                const result = cache.applyTransaction(txWrapper.transaction);
                if (txWrapper.callback) {
                    resultFuncs.push(()=>txWrapper.callback(result));
                }
            });
        });

        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(() => {
                resultFuncs.forEach(func => func());
            }, 0);
        }

        this.asyncTransactions = null;
        this.asyncTransactionsTimeout = undefined;

        this.valueCache.onDataChanged();
        this.eventService.dispatchEvent({type: Events.EVENT_STORE_UPDATED});
    }

    public flushAsyncTransactions(): void {
        if (this.asyncTransactionsTimeout!=null) {
            clearTimeout(this.asyncTransactionsTimeout);
            this.executeAsyncTransactions();
        }
    }

    public applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult {
        let res: ServerSideTransactionResult = undefined;

        this.serverSideRowModel.executeOnStore(transaction.route, cache => {
            res = cache.applyTransaction(transaction);
        });

        if (res) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({type: Events.EVENT_STORE_UPDATED});
        } else {
            return {routeFound: false, applied: false};
        }
    }
}