/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
const doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
export function getFunctionName(funcConstructor) {
    // for every other browser in the world
    if (funcConstructor.name) {
        return funcConstructor.name;
    }
    // for the pestilence that is ie11
    const matches = /function\s+([^\(]+)/.exec(funcConstructor.toString());
    return matches && matches.length === 2 ? matches[1].trim() : null;
}
export function isFunction(val) {
    return !!(val && val.constructor && val.call && val.apply);
}
export function executeInAWhile(funcs) {
    executeAfter(funcs, 400);
}
const executeNextVMTurnFuncs = [];
let executeNextVMTurnPending = false;
export function executeNextVMTurn(func) {
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
export function executeAfter(funcs, milliseconds = 0) {
    if (funcs.length > 0) {
        window.setTimeout(() => funcs.forEach(func => func()), milliseconds);
    }
}
/**
 * @param {Function} func The function to be debounced
 * @param {number} delay The time in ms to debounce
 * @return {Function} The debounced function
 */
export function debounce(func, delay) {
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
/**
 * @param {Function} func The function to be throttled
 * @param {number} wait The time in ms to throttle
 * @return {Function} The throttled function
 */
export function throttle(func, wait) {
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
export function waitUntil(condition, callback, timeout = 100, timeoutMessage) {
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
export function compose(...fns) {
    return (arg) => fns.reduce((composed, f) => f(composed), arg);
}
export function callIfPresent(func) {
    if (func) {
        func();
    }
}
export const noop = () => { return; };
