// Without per-file isolation every file in a worker shares one window and module graph, so a patch to a
// shared object registers its undo here and the setup runs it when the file ends.

const fileEndCallbacks: (() => void)[] = [];

/** Runs `callback` when the current test file ends; callbacks run last-registered first. */
export function onFileEnd(callback: () => void): void {
    fileEndCallbacks.push(callback);
}

/** `Object.defineProperty`, undone when the current test file ends: the previous own property, or none. */
export function definePropertyForFile<T extends object>(
    target: T,
    key: PropertyKey,
    descriptor: PropertyDescriptor & ThisType<any>
): void {
    const previous = Object.getOwnPropertyDescriptor(target, key);
    Object.defineProperty(target, key, descriptor);
    fileEndCallbacks.push(() => {
        if (previous) {
            Object.defineProperty(target, key, previous);
        } else {
            Reflect.deleteProperty(target, key);
        }
    });
}

/** Called by the test setup once per file, after the file's own hooks; rethrows the first undo that threw. */
export function runFileEndCallbacks(): void {
    let failed = false;
    let firstError: unknown;
    while (fileEndCallbacks.length) {
        try {
            fileEndCallbacks.pop()!();
        } catch (error) {
            if (!failed) {
                failed = true;
                firstError = error;
            }
        }
    }
    if (failed) {
        throw firstError;
    }
}
