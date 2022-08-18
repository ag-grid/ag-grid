type Callback = (params: { count: number }) => Promise<void> | void;

/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export function debouncedAnimationFrame(cb: Callback): { schedule(): void; await(): Promise<void> } {
    return buildScheduler((cb) => requestAnimationFrame(cb), cb);
}

export function debouncedCallback(cb: Callback): { schedule(): void; await(): Promise<void> } {
    return buildScheduler((cb) => setTimeout(cb, 0), cb);
}

function buildScheduler(scheduleFn: (cb: () => void) => void, cb: Callback) {
    let scheduleCount = 0;
    let promiseRunning = false;
    let awaitingPromise: Promise<void> | undefined;
    let awaitingDone: (() => void) | undefined;

    const busy = () => {
        return promiseRunning;
    };

    const done = () => {
        promiseRunning = false;

        awaitingDone?.();
        awaitingDone = undefined;
        awaitingPromise = undefined;

        if (scheduleCount > 0) {
            scheduleFn(scheduleCb);
        }
    };

    const scheduleCb = () => {
        const count = scheduleCount;

        scheduleCount = 0;
        promiseRunning = true;
        const maybePromise = cb({ count });

        if (!maybePromise) {
            done();
            return;
        }

        maybePromise.then(done).catch(done);
    };

    return {
        schedule() {
            if (scheduleCount === 0 && !busy()) {
                scheduleFn(scheduleCb);
            }
            scheduleCount++;
        },
        async await() {
            if (!busy()) {
                return;
            }

            if (!awaitingPromise) {
                awaitingPromise = new Promise((resolve) => {
                    awaitingDone = resolve;
                });
            }

            while (busy()) {
                await awaitingPromise;
            }
        },
    };
}
