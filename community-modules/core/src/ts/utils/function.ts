const doOnceFlags: { [key: string]: boolean; } = {};

/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export function doOnce(func: () => void, key: string) {
    if (doOnceFlags[key]) { return; }

    func();
    doOnceFlags[key] = true;
}

export function getFunctionName(funcConstructor: any) {
    // for every other browser in the world
    if (funcConstructor.name) {
        return funcConstructor.name;
    }

    // for the pestilence that is ie11
    const matches = /function\s+([^\(]+)/.exec(funcConstructor.toString());
    return matches && matches.length === 2 ? matches[1].trim() : null;
}

export function isFunction(val: any): boolean {
    return !!(val && val.constructor && val.call && val.apply);
}

export function executeInAWhile(funcs: Function[]): void {
    executeAfter(funcs, 400);
}

const executeNextVMTurnFuncs: Function[] = [];
let executeNextVMTurnPending = false;

export function executeNextVMTurn(func: () => void): void {
    executeNextVMTurnFuncs.push(func);

    if (executeNextVMTurnPending) { return; }

    executeNextVMTurnPending = true;
    window.setTimeout(() => {
        const funcsCopy = executeNextVMTurnFuncs.slice();
        executeNextVMTurnFuncs.length = 0;
        executeNextVMTurnPending = false;
        funcsCopy.forEach(func => func());
    }, 0);
}

export function executeAfter(funcs: Function[], milliseconds = 0): void {
    if (funcs.length > 0) {
        window.setTimeout(() => funcs.forEach(func => func()), milliseconds);
    }
}

/**
 * @param {Function} func The function to be debounced
 * @param {number} delay The time in ms to debounce
 * @return {Function} The debounced function
 */
export function debounce(func: () => void, delay: number): () => void {
    let timeout: any;

    // Calling debounce returns a new anonymous function
    return function () {
        // reference the context the setTimeout function
        const context = this;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(function() {
            func.apply(context);
        }, delay);
    };
}

/**
 * @param {Function} func The function to be throttled
 * @param {number} wait The time in ms to throttle
 * @return {Function} The throttled function
 */
export function throttle(func: (...args: any[]) => void, wait: number): (...args: any[]) => void {
    let previousCall = 0;

    return function(...args: any[]) {
        const context = this;
        const currentCall = new Date().getTime();

        if (currentCall - previousCall < wait) { return; }

        previousCall = currentCall;

        func.apply(context, args);
    };
}

export function waitUntil(condition: () => boolean, callback: () => void, timeout: number = 100, timeoutMessage?: string) {
    const timeStamp = new Date().getTime();

    let interval: number | null = null;
    let executed: boolean = false;

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

export function compose(...fns: Function[]) {
    return (arg: any) => fns.reduce((composed, f) => f(composed), arg);
}

export function callIfPresent(func: Function): void {
    if (func) { func(); }
}

export const noop = () => { return; };
