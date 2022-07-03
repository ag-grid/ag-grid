/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export function debouncedAnimationFrame(cb) {
    var scheduleCount = 0;
    return {
        schedule: function () {
            if (scheduleCount === 0) {
                requestAnimationFrame(function () {
                    var count = scheduleCount;
                    scheduleCount = 0;
                    cb({ count: count });
                });
            }
            scheduleCount++;
        }
    };
}
export function debouncedCallback(cb) {
    var scheduleCount = 0;
    return {
        schedule: function () {
            if (scheduleCount === 0) {
                setTimeout(function () {
                    var count = scheduleCount;
                    scheduleCount = 0;
                    cb({ count: count });
                }, 0);
            }
            scheduleCount++;
        }
    };
}
//# sourceMappingURL=render.js.map