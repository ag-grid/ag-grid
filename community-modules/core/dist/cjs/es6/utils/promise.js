/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
class AgPromise {
    constructor(callback) {
        this.status = AgPromiseStatus.IN_PROGRESS;
        this.resolution = null;
        this.waiters = [];
        callback(value => this.onDone(value), params => this.onReject(params));
    }
    static all(promises) {
        return new AgPromise(resolve => {
            let remainingToResolve = promises.length;
            const combinedValues = new Array(remainingToResolve);
            promises.forEach((promise, index) => {
                promise.then(value => {
                    combinedValues[index] = value;
                    remainingToResolve--;
                    if (remainingToResolve === 0) {
                        resolve(combinedValues);
                    }
                });
            });
        });
    }
    static resolve(value = null) {
        return new AgPromise(resolve => resolve(value));
    }
    then(func) {
        return new AgPromise(resolve => {
            if (this.status === AgPromiseStatus.RESOLVED) {
                resolve(func(this.resolution));
            }
            else {
                this.waiters.push(value => resolve(func(value)));
            }
        });
    }
    resolveNow(ifNotResolvedValue, ifResolved) {
        return this.status === AgPromiseStatus.RESOLVED ? ifResolved(this.resolution) : ifNotResolvedValue;
    }
    onDone(value) {
        this.status = AgPromiseStatus.RESOLVED;
        this.resolution = value;
        this.waiters.forEach(waiter => waiter(value));
    }
    onReject(params) {
        console.warn('TBI');
    }
}
exports.AgPromise = AgPromise;
