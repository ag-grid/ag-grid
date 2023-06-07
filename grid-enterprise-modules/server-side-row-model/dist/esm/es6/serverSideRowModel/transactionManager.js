var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Events, PostConstruct, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
let TransactionManager = class TransactionManager extends BeanStub {
    constructor() {
        super(...arguments);
        this.asyncTransactions = [];
    }
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
    }
    applyTransactionAsync(transaction, callback) {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    }
    scheduleExecuteAsync() {
        const waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(() => {
            this.executeAsyncTransactions();
        }, waitMillis);
    }
    executeAsyncTransactions() {
        if (!this.asyncTransactions) {
            return;
        }
        const resultFuncs = [];
        const resultsForEvent = [];
        const transactionsToRetry = [];
        let atLeastOneTransactionApplied = false;
        this.asyncTransactions.forEach(txWrapper => {
            let result;
            this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, cache => {
                result = cache.applyTransaction(txWrapper.transaction);
            });
            if (result == undefined) {
                result = { status: ServerSideTransactionResultStatus.StoreNotFound };
            }
            resultsForEvent.push(result);
            const retryTransaction = result.status == ServerSideTransactionResultStatus.StoreLoading;
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
        this.asyncTransactionsTimeout = undefined;
        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;
        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: Events.EVENT_STORE_UPDATED });
        }
        if (resultsForEvent.length > 0) {
            const event = {
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event);
        }
    }
    flushAsyncTransactions() {
        // the timeout could be missing, if we are flushing due to row data loaded
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
        }
        this.executeAsyncTransactions();
    }
    applyTransaction(transaction) {
        let res;
        this.serverSideRowModel.executeOnStore(transaction.route, store => {
            res = store.applyTransaction(transaction);
        });
        if (res) {
            this.valueCache.onDataChanged();
            if (res.remove) {
                const removedRowIds = res.remove.map(row => row.id);
                this.selectionService.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
            }
            this.eventService.dispatchEvent({ type: Events.EVENT_STORE_UPDATED });
            return res;
        }
        else {
            return { status: ServerSideTransactionResultStatus.StoreNotFound };
        }
    }
};
__decorate([
    Autowired('rowNodeBlockLoader')
], TransactionManager.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    Autowired('valueCache')
], TransactionManager.prototype, "valueCache", void 0);
__decorate([
    Autowired('rowModel')
], TransactionManager.prototype, "serverSideRowModel", void 0);
__decorate([
    Autowired('rowRenderer')
], TransactionManager.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('selectionService')
], TransactionManager.prototype, "selectionService", void 0);
__decorate([
    PostConstruct
], TransactionManager.prototype, "postConstruct", null);
TransactionManager = __decorate([
    Bean('ssrmTransactionManager')
], TransactionManager);
export { TransactionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC90cmFuc2FjdGlvbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQUNSLE1BQU0sRUFFTixhQUFhLEVBSWIsaUNBQWlDLEVBTXBDLE1BQU0seUJBQXlCLENBQUM7QUFVakMsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBbUIsU0FBUSxRQUFRO0lBQWhEOztRQVNZLHNCQUFpQixHQUE4QixFQUFFLENBQUM7SUFnSDlELENBQUM7SUE3R1csYUFBYTtRQUNqQiw4RkFBOEY7UUFDOUYsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7SUFDMUUsQ0FBQztJQUVNLHFCQUFxQixDQUFDLFdBQWtDLEVBQUUsUUFBcUQ7UUFDbEgsSUFBSSxJQUFJLENBQUMsd0JBQXdCLElBQUksSUFBSSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVPLG9CQUFvQjtRQUN4QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUMzRSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDbkQsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDcEMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFTyx3QkFBd0I7UUFD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