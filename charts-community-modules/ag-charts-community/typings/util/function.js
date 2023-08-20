"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDoOnceFlags = exports.doOnce = void 0;
var doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 */
function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
exports.doOnce = doOnce;
/** Clear doOnce() state (for test purposes). */
function clearDoOnceFlags() {
    for (var key in doOnceFlags) {
        delete doOnceFlags[key];
    }
}
exports.clearDoOnceFlags = clearDoOnceFlags;
//# sourceMappingURL=function.js.map