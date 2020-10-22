"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var LoadingStrategy;
(function (LoadingStrategy) {
    LoadingStrategy["ApplyAfterLoaded"] = "applyAfterLoaded";
    LoadingStrategy["DoNotApply"] = "doNotApply";
})(LoadingStrategy || (LoadingStrategy = {}));
var TransactionManager = /** @class */ (function (_super) {
    __extends(TransactionManager, _super);
    function TransactionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TransactionManager.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.setupLoadingStrategy();
    };
    TransactionManager.prototype.setupLoadingStrategy = function () {
        var loadingStrategy = this.gridOptionsWrapper.getServerSideAsyncTransactionLoadingStrategy();
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
                var strategies = Object.keys(LoadingStrategy).join(', ');
                console.warn("ag-Grid: Invalid loading strategy: " + loadingStrategy + ", should be one of [" + strategies + "]");
                this.loadingStrategy = LoadingStrategy.DoNotApply;
                break;
        }
    };
    TransactionManager.prototype.applyTransactionAsync = function (transaction, callback) {
        if (this.asyncTransactionsTimeout == null) {
            this.asyncTransactions = [];
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    };
    TransactionManager.prototype.scheduleExecuteAsync = function () {
        var _this = this;
        var waitMillis = this.gridOptionsWrapper.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(function () {
            _this.executeAsyncTransactions();
        }, waitMillis);
    };
    TransactionManager.prototype.executeAsyncTransactions = function () {
        var _this = this;
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
                result = { status: core_1.ServerSideTransactionResultStatus.StoreNotFound };
            }
            resultsForEvent.push(result);
            var retryTransaction = result.status == core_1.ServerSideTransactionResultStatus.StoreLoading && _this.loadingStrategy == LoadingStrategy.ApplyAfterLoaded;
            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }
            if (txWrapper.callback) {
                resultFuncs.push(function () { return txWrapper.callback(result); });
            }
            if (result.status === core_1.ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        });
        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(function () {
                resultFuncs.forEach(function (func) { return func(); });
            }, 0);
        }
        if (transactionsToRetry.length > 0) {
            this.scheduleExecuteAsync();
            this.asyncTransactions = transactionsToRetry;
        }
        else {
            this.asyncTransactions = null;
            this.asyncTransactionsTimeout = undefined;
        }
        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: core_1.Events.EVENT_STORE_UPDATED });
        }
        if (resultsForEvent.length > 0) {
            var event_1 = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                type: core_1.Events.EVENT_ASYNC_TRANSACTIONS_APPLIED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    TransactionManager.prototype.flushAsyncTransactions = function () {
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
            this.executeAsyncTransactions();
        }
    };
    TransactionManager.prototype.applyTransaction = function (transaction) {
        var res;
        this.serverSideRowModel.executeOnStore(transaction.route, function (cache) {
            res = cache.applyTransaction(transaction);
        });
        if (res) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: core_1.Events.EVENT_STORE_UPDATED });
        }
        else {
            return { status: core_1.ServerSideTransactionResultStatus.StoreNotFound };
        }
    };
    __decorate([
        core_1.Autowired('rowNodeBlockLoader')
    ], TransactionManager.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], TransactionManager.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('valueCache')
    ], TransactionManager.prototype, "valueCache", void 0);
    __decorate([
        core_1.Autowired('rowModel')
    ], TransactionManager.prototype, "serverSideRowModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], TransactionManager.prototype, "postConstruct", null);
    TransactionManager = __decorate([
        core_1.Bean('serverSideTransactionManager')
    ], TransactionManager);
    return TransactionManager;
}(core_1.BeanStub));
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=transactionManager.js.map