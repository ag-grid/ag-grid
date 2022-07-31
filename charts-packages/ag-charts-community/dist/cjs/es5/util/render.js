"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
function debouncedAnimationFrame(cb) {
    return buildScheduler(function (cb) { return requestAnimationFrame(cb); }, cb);
}
exports.debouncedAnimationFrame = debouncedAnimationFrame;
function debouncedCallback(cb) {
    return buildScheduler(function (cb) { return setTimeout(cb, 0); }, cb);
}
exports.debouncedCallback = debouncedCallback;
function buildScheduler(scheduleFn, cb) {
    var scheduleCount = 0;
    return {
        schedule: function () {
            if (scheduleCount === 0) {
                scheduleFn(function () {
                    var count = scheduleCount;
                    scheduleCount = 0;
                    cb({ count: count });
                });
            }
            scheduleCount++;
        },
    };
}
