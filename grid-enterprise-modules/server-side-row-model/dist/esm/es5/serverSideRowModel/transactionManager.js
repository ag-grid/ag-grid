var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Events, PostConstruct, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
var TransactionManager = /** @class */ (function (_super) {
    __extends(TransactionManager, _super);
    function TransactionManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.asyncTransactions = [];
        return _this;
    }
    TransactionManager.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
    };
    TransactionManager.prototype.applyTransactionAsync = function (transaction, callback) {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    };
    TransactionManager.prototype.scheduleExecuteAsync = function () {
        var _this = this;
        var waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(function () {
            _this.executeAsyncTransactions();
        }, waitMillis);
    };
    TransactionManager.prototype.executeAsyncTransactions = function () {
        var _this = this;
        if (!this.asyncTransactions) {
            return;
        }
        var resultFuncs = [];
        var resultsForEvent = [];
        var transactionsToRetry = [];
        var atLeastOneTransactionApplied = false;
        this.asyncTransactions.forEach(function (txWrapper) {
            var result;
            _this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, function (cache) {
                result = cache.applyTransaction(txWrapper.transaction);
            });
            if (result == undefined) {
                result = { status: ServerSideTransactionResultStatus.StoreNotFound };
            }
            resultsForEvent.push(result);
            var retryTransaction = result.status == ServerSideTransactionResultStatus.StoreLoading;
            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }
            if (txWrapper.callback) {
                resultFuncs.push(function () { return txWrapper.callback(result); });
            }
            if (result.status === ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        });
        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(function () {
                resultFuncs.forEach(function (func) { return func(); });
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
            var event_1 = {
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    TransactionManager.prototype.flushAsyncTransactions = function () {
        // the timeout could be missing, if we are flushing due to row data loaded
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
        }
        this.executeAsyncTransactions();
    };
    TransactionManager.prototype.applyTransaction = function (transaction) {
        var res;
        this.serverSideRowModel.executeOnStore(transaction.route, function (store) {
            res = store.applyTransaction(transaction);
        });
        if (res) {
            this.valueCache.onDataChanged();
            if (res.remove) {
                var removedRowIds = res.remove.map(function (row) { return row.id; });
                this.selectionService.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
            }
            this.eventService.dispatchEvent({ type: Events.EVENT_STORE_UPDATED });
            return res;
        }
        else {
            return { status: ServerSideTransactionResultStatus.StoreNotFound };
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
    return TransactionManager;
}(BeanStub));
export { TransactionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC90cmFuc2FjdGlvbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQUNSLE1BQU0sRUFFTixhQUFhLEVBSWIsaUNBQWlDLEVBTXBDLE1BQU0seUJBQXlCLENBQUM7QUFVakM7SUFBd0Msc0NBQVE7SUFBaEQ7UUFBQSxxRUF5SEM7UUFoSFcsdUJBQWlCLEdBQThCLEVBQUUsQ0FBQzs7SUFnSDlELENBQUM7SUE3R1csMENBQWEsR0FBckI7UUFDSSw4RkFBOEY7UUFDOUYsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7SUFDMUUsQ0FBQztJQUVNLGtEQUFxQixHQUE1QixVQUE2QixXQUFrQyxFQUFFLFFBQXFEO1FBQ2xILElBQUksSUFBSSxDQUFDLHdCQUF3QixJQUFJLElBQUksRUFBRTtZQUN2QyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztTQUMvQjtRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFTyxpREFBb0IsR0FBNUI7UUFBQSxpQkFLQztRQUpHLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBQzNFLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQzlDLEtBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3BDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuQixD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