import { setTimeout as __asyncSetTimeout } from 'timers/promises';

export const asyncSetTimeout = __asyncSetTimeout;

export async function flushJestTimers() {
    jest.advanceTimersByTime(10000);
    jest.useRealTimers();
    await asyncSetTimeout(1);
}

export interface PromiseWithCancel<TResult> extends Promise<TResult> {
    cancel: () => boolean;
}

/** Executes a promise with a timeout. If the promise is not resolved in time, an error will be thrown */
export function executeWithTimeout<TResult = void>(
    promise: (() => PromiseLike<TResult>) | PromiseLike<TResult>,
    timeout = 2000,
    onTimedOut?: () => void,
    callerForStackTrace: any = executeWithTimeout
): PromiseWithCancel<TResult> {
    const timeoutError = new Error('❌ Timeout after ' + timeout + 'ms');
    Object.assign(timeoutError, { timeout, code: 'ETIMEDOUT' });
    Error.captureStackTrace(timeoutError, callerForStackTrace);
    let abortController: AbortController | null = new AbortController();
    let result: TResult;
    const cancel = (): boolean => {
        if (abortController && !abortController.signal.aborted) {
            abortController.abort();
            abortController = null;
            return true;
        }
        return false;
    };
    const start = async () => {
        try {
            result = await (typeof promise === 'function' ? promise() : promise);
            return result;
        } finally {
            cancel();
        }
    };
    const startTimeout = async () => {
        try {
            await asyncSetTimeout(timeout, abortController);
            if (!cancel()) {
                return result!;
            }
            onTimedOut?.();
            onTimedOut = undefined;
        } catch {
            cancel();
        }
        throw timeoutError;
    };
    const promiseWithTimeout = Promise.race([startTimeout(), start()]) as PromiseWithCancel<TResult>;
    promiseWithTimeout.cancel = cancel;
    return promiseWithTimeout;
}

/** Returns a function that when invoked sets the new result value and restart the throttle timer promise */
export function createThrottle<TResult = void>(callback: (result: TResult) => void, delay = 0) {
    let abortController: AbortController | null = null;
    let finalResult: TResult | undefined;
    const invokeCallback = () => callback(finalResult!);
    const throttled = (result: TResult) => {
        finalResult = result;
        abortController?.abort();
        abortController = new AbortController();
        asyncSetTimeout(delay, { signal: abortController.signal }).then(invokeCallback);
    };
    return throttled;
}

export interface DomMutationWaiterOptions extends MutationObserverInit {
    element?: Element | string | null;
    timeout?: number;
    throttle?: number;
}

/** Awaits that mutation happens in the DOM. Useful to be sure that an API did cause the DOM to change. */
export class DomMutationWaiter {
    private mutated: boolean = false;
    public mutationObserver: MutationObserver | null = null;
    public readonly mutations: MutationRecord[] = [];

    private throttled: () => void;
    private listeners: (() => void)[] = [];

    public constructor(public readonly options: DomMutationWaiterOptions = {}) {
        this.throttled = createThrottle(() => {
            this.mutated = true;
            const copy = this.listeners.slice();
            this.listeners.length = 0;
            copy.forEach((listener) => listener());
        }, options.throttle ?? 1);
    }

    public addListener(listener: () => void): this {
        this.listeners.push(listener);
        return this;
    }

    public removeListener(listener: () => void): this {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
        return this;
    }

    public start(): this {
        if (this.mutationObserver) {
            return this;
        }
        this.mutated = false;
        this.mutationObserver = new MutationObserver((records) => {
            this.mutations.push(...records);
            this.throttled();
        });
        let element = this.options.element;
        if (typeof element === 'string') {
            element = document.getElementById(element) ?? document.querySelector(element);
        }
        if (element === undefined) {
            element = document.body;
        } else if (!element) {
            throw new Error('Element ' + this.options.element + ' not found');
        }
        this.mutationObserver.observe(element, { childList: true, subtree: true, attributes: true, ...this.options });
        return this;
    }

    public wait(timeout = this.options.timeout): PromiseWithCancel<this> {
        return executeWithTimeout(() => {
            return new Promise((resolve) => {
                if (!this.mutationObserver) {
                    this.start();
                }
                if (this.mutated) {
                    resolve(this);
                } else {
                    const listener = () => {
                        resolve(this);
                        this.removeListener(listener);
                        this.mutated = false;
                    };
                    this.addListener(listener);
                }
            });
        }, timeout);
    }

    public async waitAndStop(timeout = this.options.timeout): Promise<this> {
        await this.wait(timeout);
        this.stop();
        return this;
    }

    public stop(): this {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        return this;
    }

    public dispose(): void {
        this.stop();
    }

    public static start(options: DomMutationWaiterOptions = {}): DomMutationWaiter {
        return new DomMutationWaiter(options).start();
    }
}
