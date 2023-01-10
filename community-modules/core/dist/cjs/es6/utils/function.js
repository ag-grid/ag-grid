/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = exports.callIfPresent = exports.compose = exports.waitUntil = exports.throttle = exports.debounce = exports.executeAfter = exports.executeNextVMTurn = exports.executeInAWhile = exports.isFunction = exports.getFunctionName = exports.doOnce = void 0;
const doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
exports.doOnce = doOnce;
function getFunctionName(funcConstructor) {
    // for every other browser in the world
    if (funcConstructor.name) {
        return funcConstructor.name;
    }
    // for the pestilence that is ie11
    const matches = /function\s+([^\(]+)/.exec(funcConstructor.toString());
    return matches && matches.length === 2 ? matches[1].trim() : null;
}
exports.getFunctionName = getFunctionName;
function isFunction(val) {
    return !!(val && val.constructor && val.call && val.apply);
}
exports.isFunction = isFunction;
function executeInAWhile(funcs) {
    executeAfter(funcs, 400);
}
exports.executeInAWhile = executeInAWhile;
const executeNextVMTurnFuncs = [];
let executeNextVMTurnPending = false;
function executeNextVMTurn(func) {
    executeNextVMTurnFuncs.push(func);
    if (executeNextVMTurnPending) {
        return;
    }
    executeNextVMTurnPending = true;
    window.setTimeout(() => {
        const funcsCopy = executeNextVMTurnFuncs.slice();
        executeNextVMTurnFuncs.length = 0;
        executeNextVMTurnPending = false;
        funcsCopy.forEach(func => func());
    }, 0);
}
exports.executeNextVMTurn = executeNextVMTurn;
function executeAfter(funcs, milliseconds = 0) {
    if (funcs.length > 0) {
        window.setTimeout(() => funcs.forEach(func => func()), milliseconds);
    }
}
exports.executeAfter = executeAfter;
/**
 * @param {Function} func The function to be debounced
 * @param {number} delay The time in ms to debounce
 * @return {Function} The debounced function
 */
function debounce(func, delay) {
    let timeout;
    // Calling debounce returns a new anonymous function
    return function (...args) {
        const context = this;
        window.clearTimeout(timeout);
        // Set the new timeout
        timeout = window.setTimeout(function () {
            func.apply(context, args);
        }, delay);
    };
}
exports.debounce = debounce;
/**
 * @param {Function} func The function to be throttled
 * @param {number} wait The time in ms to throttle
 * @return {Function} The throttled function
 */
function throttle(func, wait) {
    let previousCall = 0;
    return function (...args) {
        const context = this;
        const currentCall = new Date().getTime();
        if (currentCall - previousCall < wait) {
            return;
        }
        previousCall = currentCall;
        func.apply(context, args);
    };
}
exports.throttle = throttle;
function waitUntil(condition, callback, timeout = 100, timeoutMessage) {
    const timeStamp = new Date().getTime();
    let interval = null;
    let executed = false;
    const internalCallback = () => {
        const reachedTimeout = ((new Date().getTime()) - timeStamp) > timeout;
        if (condition() || reachedTimeout) {
            callback();
            executed = true;
            if (interval != null) {
                window.clearInterval(interval);
                interval = null;
            }
            if (reachedTimeout && timeoutMessage) {
                console.warn(timeoutMessage);
            }
        }
    };
    internalCallback();
    if (!executed) {
        interval = window.setInterval(internalCallback, 10);
    }
}
exports.waitUntil = waitUntil;
function compose(...fns) {
    return (arg) => fns.reduce((composed, f) => f(composed), arg);
}
exports.compose = compose;
function callIfPresent(func) {
    if (func) {
        func();
    }
}
exports.callIfPresent = callIfPresent;
exports.noop = () => { return; };
