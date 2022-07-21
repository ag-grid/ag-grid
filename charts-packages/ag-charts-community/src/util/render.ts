type Callback = (params: { count: number }) => void;

/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export function debouncedAnimationFrame(cb: Callback): { schedule(): void } {
    return buildScheduler((cb) => requestAnimationFrame(cb), cb);
}

export function debouncedCallback(cb: Callback): { schedule(): void } {
    return buildScheduler((cb) => setTimeout(cb, 0), cb);
}

function buildScheduler(scheduleFn: (cb: () => void) => void, cb: Callback) {
    let scheduleCount = 0;

    return {
        schedule() {
            if (scheduleCount === 0) {
                scheduleFn(() => {
                    const count = scheduleCount;
                    scheduleCount = 0;
                    cb({ count });
                });
            }
            scheduleCount++;
        },
    };
}
