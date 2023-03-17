"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
function sleep(sleepTimeoutMs) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(undefined); }, sleepTimeoutMs);
    });
}
exports.sleep = sleep;
