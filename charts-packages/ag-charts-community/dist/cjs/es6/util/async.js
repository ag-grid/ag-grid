"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(sleepTimeoutMs) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(undefined), sleepTimeoutMs);
    });
}
exports.sleep = sleep;
