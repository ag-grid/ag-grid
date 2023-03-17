/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgPromise = exports.AgPromiseStatus = void 0;
var AgPromiseStatus;
(function (AgPromiseStatus) {
    AgPromiseStatus[AgPromiseStatus["IN_PROGRESS"] = 0] = "IN_PROGRESS";
    AgPromiseStatus[AgPromiseStatus["RESOLVED"] = 1] = "RESOLVED";
})(AgPromiseStatus = exports.AgPromiseStatus || (exports.AgPromiseStatus = {}));
var AgPromise = /** @class */ (function () {
    function AgPromise(callback) {
        var _this = this;
        this.status = AgPromiseStatus.IN_PROGRESS;
        this.resolution = null;
        this.waiters = [];
        callback(function (value) { return _this.onDone(value); }, function (params) { return _this.onReject(params); });
    }
    AgPromise.all = function (promises) {
        return new AgPromise(function (resolve) {
            var remainingToResolve = promises.length;
            var combinedValues = new Array(remainingToResolve);
            promises.forEach(function (promise, index) {
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
    AgPromise.resolve = function (value) {
        if (value === void 0) { value = null; }
        return new AgPromise(function (resolve) { return resolve(value); });
    };
    AgPromise.prototype.then = function (func) {
        var _this = this;
        return new AgPromise(function (resolve) {
            if (_this.status === AgPromiseStatus.RESOLVED) {
                resolve(func(_this.resolution));
            }
            else {
                _this.waiters.push(function (value) { return resolve(func(value)); });
            }
        });
    };
    AgPromise.prototype.resolveNow = function (ifNotResolvedValue, ifResolved) {
        return this.status === AgPromiseStatus.RESOLVED ? ifResolved(this.resolution) : ifNotResolvedValue;
    };
    AgPromise.prototype.onDone = function (value) {
        this.status = AgPromiseStatus.RESOLVED;
        this.resolution = value;
        this.waiters.forEach(function (waiter) { return waiter(value); });
    };
    AgPromise.prototype.onReject = function (params) {
        console.warn('TBI');
    };
    return AgPromise;
}());
exports.AgPromise = AgPromise;
