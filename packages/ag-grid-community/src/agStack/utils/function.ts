import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _requestAnimationFrame } from './dom';

const doOnceFlags: { [key: string]: boolean } = {};

/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export function _doOnce(func: () => void, key: string) {
    if (doOnceFlags[key]) {
        return;
    }

    func();
    doOnceFlags[key] = true;
}

type BatchedCalls = {
    pending: boolean;
    funcs: Array<(...args: any[]) => any>;
};

const batchedCallsSetTimeout: BatchedCalls = {
    pending: false,
    funcs: [],
};
const batchedCallsRaf: BatchedCalls = {
    pending: false,
    funcs: [],
};

/*
 * Batch calls to execute after the next macro task (mode = setTimeout) / or in the next requestAnimationFrame.
 * @param {Function} func The function to be batched
 */
export function _batchCall(func: () => void): void;
export function _batchCall(func: () => void, mode: 'raf', beans: UtilBeanCollection): void;
export function _batchCall(
    func: () => void,
    mode: 'setTimeout' | 'raf' = 'setTimeout',
    beans?: UtilBeanCollection
): void {
    const batch = mode === 'raf' ? batchedCallsRaf : batchedCallsSetTimeout;

    batch.funcs.push(func);

    if (batch.pending) {
        return;
    }

    batch.pending = true;
    const runBatch = () => {
        const funcsCopy = batch.funcs.slice();
        batch.funcs.length = 0;
        batch.pending = false;
        for (const func of funcsCopy) {
            func();
        }
    };

    if (mode === 'raf') {
        _requestAnimationFrame(beans!, runBatch);
    } else {
        window.setTimeout(runBatch, 0);
    }
}

/**
 * Creates a debounced function a function, and attach it to a bean for lifecycle
 * @param {Function} func The function to be debounced
 * @param {number} delay The time in ms to debounce
 * @returns {Function} The debounced function
 */
export function _debounce<TArgs extends any[], TContext>(
    bean: { isAlive(): boolean },
    func: (this: TContext, ...args: TArgs) => void,
    delay: number
): (this: TContext, ...args: TArgs) => void {
    let timeout: any;

    // Calling debounce returns a new anonymous function
    return function (this: TContext, ...args: TArgs) {
        const context = this as any;
        window.clearTimeout(timeout);

        // Set the new timeout
        timeout = window.setTimeout(function () {
            // at the moment we just check if the bean is still alive, in the future the bean stub should
            // another option is to manage a list of active timers and clear them when the bean is destroyed.
            if (bean.isAlive()) {
                func.apply(context, args);
            }
        }, delay);
    };
}

/**
 * @param {Function} func The function to be throttled
 * @param {number} wait The time in ms to throttle
 * @returns {Function} The throttled function
 */
export function _throttle(func: (...args: any[]) => void, wait: number): (...args: any[]) => void {
    let previousCall = 0;

    return function (...args: any[]) {
        //@ts-expect-error no implicit this
        const context = this;
        const currentCall = Date.now();

        if (currentCall - previousCall < wait) {
            return;
        }

        previousCall = currentCall;

        func.apply(context, args);
    };
}

export function _waitUntil(
    bean: { addDestroyFunc(func: () => void): void },
    condition: () => boolean,
    callback: () => void,
    timeout: number = 100
) {
    const timeStamp = Date.now();

    let interval: number | null = null;
    let executed: boolean = false;

    const clearWait = () => {
        if (interval != null) {
            window.clearInterval(interval);
            interval = null;
        }
    };
    bean.addDestroyFunc(clearWait);

    const internalCallback = () => {
        const reachedTimeout = Date.now() - timeStamp > timeout;
        if (condition() || reachedTimeout) {
            callback();
            executed = true;
            clearWait();
        }
    };

    internalCallback();

    if (!executed) {
        interval = window.setInterval(internalCallback, 10);
    }
}
