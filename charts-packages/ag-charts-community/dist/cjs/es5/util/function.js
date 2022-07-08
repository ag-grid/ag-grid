"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
exports.doOnce = doOnce;
