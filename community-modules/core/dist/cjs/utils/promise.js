/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = require("./array");
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["IN_PROGRESS"] = 0] = "IN_PROGRESS";
    PromiseStatus[PromiseStatus["RESOLVED"] = 1] = "RESOLVED";
})(PromiseStatus = exports.PromiseStatus || (exports.PromiseStatus = {}));
var Promise = /** @class */ (function () {
    function Promise(callback) {
        var _this = this;
        this.status = PromiseStatus.IN_PROGRESS;
        this.resolution = null;
        this.waiters = [];
        callback(function (value) { return _this.onDone(value); }, function (params) { return _this.onReject(params); });
    }
    Promise.all = function (promises) {
        return new Promise(function (resolve) {
            var remainingToResolve = promises.length;
            var combinedValues = new Array(remainingToResolve);
            array_1.forEach(promises, function (promise, index) {
                promise.then(function (value) {
                    combinedValues[index] = value;
                    remainingToResolve--;
                    if (remainingToResolve === 0) {
                        resolve(combinedValues);
                    }
                });
            });
        });
    };
    Promise.resolve = function (value) {
        if (value === void 0) { value = null; }
        return new Promise(function (resolve) { return resolve(value); });
    };
    Promise.prototype.then = function (func) {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.status === PromiseStatus.RESOLVED) {
                resolve(func(_this.resolution));
            }
            else {
                _this.waiters.push(function (value) { return resolve(func(value)); });
            }
        });
    };
    Promise.prototype.resolveNow = function (ifNotResolvedValue, ifResolved) {
        return this.status === PromiseStatus.RESOLVED ? ifResolved(this.resolution) : ifNotResolvedValue;
    };
    Promise.prototype.onDone = function (value) {
        this.status = PromiseStatus.RESOLVED;
        this.resolution = value;
        array_1.forEach(this.waiters, function (waiter) { return waiter(value); });
    };
    Promise.prototype.onReject = function (params) {
        console.warn('TBI');
    };
    return Promise;
}());
exports.Promise = Promise;

//# sourceMappingURL=promise.js.map
