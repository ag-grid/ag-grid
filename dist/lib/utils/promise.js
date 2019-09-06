/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["IN_PROGRESS"] = 0] = "IN_PROGRESS";
    PromiseStatus[PromiseStatus["RESOLVED"] = 1] = "RESOLVED";
})(PromiseStatus = exports.PromiseStatus || (exports.PromiseStatus = {}));
var Promise = /** @class */ (function () {
    function Promise(callback) {
        this.status = PromiseStatus.IN_PROGRESS;
        this.resolution = null;
        this.listOfWaiters = [];
        callback(this.onDone.bind(this), this.onReject.bind(this));
    }
    Promise.all = function (toCombine) {
        return new Promise(function (resolve) {
            var combinedValues = [];
            var remainingToResolve = toCombine.length;
            toCombine.forEach(function (source, index) {
                source.then(function (sourceResolved) {
                    remainingToResolve--;
                    combinedValues[index] = sourceResolved;
                    if (remainingToResolve == 0) {
                        resolve(combinedValues);
                    }
                });
                combinedValues.push(null); // spl todo: review with Alberto - why?
            });
        });
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve) { return resolve(value); });
    };
    Promise.external = function () {
        var capture;
        var promise = new Promise(function (resolve) {
            capture = resolve;
        });
        return {
            promise: promise,
            resolve: function (value) {
                capture(value);
            }
        };
    };
    Promise.prototype.then = function (func) {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            this.listOfWaiters.push(func);
        }
        else {
            func(this.resolution);
        }
    };
    Promise.prototype.firstOneOnly = function (func) {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            if (this.listOfWaiters.length === 0) {
                this.listOfWaiters.push(func);
            }
        }
        else {
            func(this.resolution);
        }
    };
    Promise.prototype.map = function (adapter) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.then(function (unmapped) {
                resolve(adapter(unmapped));
            });
        });
    };
    Promise.prototype.resolveNow = function (ifNotResolvedValue, ifResolved) {
        if (this.status == PromiseStatus.IN_PROGRESS) {
            return ifNotResolvedValue;
        }
        return ifResolved(this.resolution);
    };
    Promise.prototype.onDone = function (value) {
        this.status = PromiseStatus.RESOLVED;
        this.resolution = value;
        this.listOfWaiters.forEach(function (waiter) { return waiter(value); });
    };
    Promise.prototype.onReject = function (params) {
        console.warn('TBI');
    };
    return Promise;
}());
exports.Promise = Promise;
