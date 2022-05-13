/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export function debouncedAnimationFrame(cb: (params: { count: number}) => void): { schedule(): void } {
    let scheduleCount = 0;

    return {
        schedule() {
            if (scheduleCount === 0) {
                requestAnimationFrame(() => {
                    const count = scheduleCount;
                    scheduleCount = 0;
                    cb({ count });
                });
            }
            scheduleCount++;
        }
    };
}
