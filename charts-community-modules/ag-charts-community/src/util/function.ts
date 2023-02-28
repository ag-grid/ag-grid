const doOnceFlags: { [key: string]: boolean } = {};

/**
 * If the key was passed before, then doesn't execute the func
 */
export function doOnce(func: () => void, key: string) {
    if (doOnceFlags[key]) {
        return;
    }

    func();
    doOnceFlags[key] = true;
}

/** Clear doOnce() state (for test purposes). */
export function clearDoOnceFlags() {
    for (const key in doOnceFlags) {
        delete doOnceFlags[key];
    }
}
