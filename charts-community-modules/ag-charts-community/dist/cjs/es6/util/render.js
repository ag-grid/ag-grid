"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debouncedCallback = exports.debouncedAnimationFrame = void 0;
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
    let promiseRunning = false;
    let awaitingPromise;
    let awaitingDone;
    const busy = () => {
        return promiseRunning;
    };
    const done = () => {
        promiseRunning = false;
        awaitingDone === null || awaitingDone === void 0 ? void 0 : awaitingDone();
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
        await() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!busy()) {
                    return;
                }
                if (!awaitingPromise) {
                    awaitingPromise = new Promise((resolve) => {
                        awaitingDone = resolve;
                    });
                }
                while (busy()) {
                    yield awaitingPromise;
                }
            });
        },
    };
}
