/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideTransactionResultStatus = void 0;
var ServerSideTransactionResultStatus;
(function (ServerSideTransactionResultStatus) {
    /** Transaction was successfully applied */
    ServerSideTransactionResultStatus["Applied"] = "Applied";
    /**
     * Store was not found, transaction not applied.
     * Either invalid route, or the parent row has not yet been expanded.
     */
    ServerSideTransactionResultStatus["StoreNotFound"] = "StoreNotFound";
    /**
     * Store is loading, transaction not applied.
     */
    ServerSideTransactionResultStatus["StoreLoading"] = "StoreLoading";
    /**
     * Store is loading (as max loads exceeded), transaction not applied.
     */
    ServerSideTransactionResultStatus["StoreWaitingToLoad"] = "StoreWaitingToLoad";
    /**
     * Store load attempt failed, transaction not applied.
     */
    ServerSideTransactionResultStatus["StoreLoadingFailed"] = "StoreLoadingFailed";
    /**
     * Store is type Partial, which doesn't accept transactions
     */
    ServerSideTransactionResultStatus["StoreWrongType"] = "StoreWrongType";
    /**
     * Transaction was cancelled, due to grid.
     * Callback isApplyServerSideTransaction() returning false
     */
    ServerSideTransactionResultStatus["Cancelled"] = "Cancelled";
})(ServerSideTransactionResultStatus = exports.ServerSideTransactionResultStatus || (exports.ServerSideTransactionResultStatus = {}));
