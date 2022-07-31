var doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
