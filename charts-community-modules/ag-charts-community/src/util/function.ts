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

export function createFunctionFromString(args: string[], body: string) {
    return new Function(args.join(', '), body.includes('return ') ? body : `return ${body};`);
}

export function paramsFunction<F extends (params: any) => any>(fn: F | string | undefined): F | undefined {
    if (!fn || typeof fn === 'function') {
        return fn as F | undefined;
    }
    return createFunctionFromString(['params'], fn) as F;
}
