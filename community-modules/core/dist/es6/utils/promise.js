/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { forEach } from './array';
export var AgPromiseStatus;
(function (AgPromiseStatus) {
    AgPromiseStatus[AgPromiseStatus["IN_PROGRESS"] = 0] = "IN_PROGRESS";
    AgPromiseStatus[AgPromiseStatus["RESOLVED"] = 1] = "RESOLVED";
})(AgPromiseStatus || (AgPromiseStatus = {}));
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
            forEach(promises, function (promise, index) {
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
        forEach(this.waiters, function (waiter) { return waiter(value); });
    };
    AgPromise.prototype.onReject = function (params) {
        console.warn('TBI');
    };
    return AgPromise;
}());
export { AgPromise };
