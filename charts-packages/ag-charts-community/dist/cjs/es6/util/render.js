"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
function debouncedAnimationFrame(cb) {
    return buildScheduler((cb) => requestAnimationFrame(cb), cb);
}
exports.debouncedAnimationFrame = debouncedAnimationFrame;
function debouncedCallback(cb) {
    return buildScheduler((cb) => setTimeout(cb, 0), cb);
}
exports.debouncedCallback = debouncedCallback;
function buildScheduler(scheduleFn, cb) {
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
