// Intervals still running when a test file ends: a popup anchored when its grid was destroyed keeps polling its
// anchor on one, which would fire into every later file of the worker. Installed once per worker, at import.

const realSetInterval = globalThis.setInterval;
const realClearInterval = globalThis.clearInterval;
const liveIntervals = new Set<ReturnType<typeof setInterval>>();

// Cast: the global's type merges the DOM and Node overloads, which no single function signature satisfies.
globalThis.setInterval = ((...args: Parameters<typeof realSetInterval>) => {
    const id = realSetInterval(...args);
    liveIntervals.add(id);
    return id;
}) as typeof setInterval;

globalThis.clearInterval = ((id: ReturnType<typeof setInterval> | undefined) => {
    if (id !== undefined) {
        liveIntervals.delete(id);
    }
    realClearInterval(id);
}) as typeof clearInterval;

/** Stops every interval started since the last call and still running: called at each file's end. */
export function clearFileIntervals(): void {
    for (const id of liveIntervals) {
        realClearInterval(id);
    }
    liveIntervals.clear();
}
