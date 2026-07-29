import v8 from 'node:v8';
import vm from 'node:vm';

let gcFn: (() => void) | null = null;

/**
 * `--expose-gc` is a per-isolate V8 flag, so each Vitest worker must enable it for itself. The flag is
 * restored straight after grabbing the function, otherwise every other test file sharing this worker
 * would run with a different GC configuration.
 */
const acquireGc = (): (() => void) => {
    const existing = (globalThis as { gc?: () => void }).gc;
    if (typeof existing === 'function') {
        return existing;
    }

    v8.setFlagsFromString('--expose-gc');
    try {
        const exposed = vm.runInNewContext('gc');
        if (typeof exposed !== 'function') {
            throw new Error('gc is not a function');
        }
        return exposed;
    } catch (e) {
        throw new Error('Could not expose V8 gc, which retention tests require. Run node with --expose-gc.', {
            cause: e,
        });
    } finally {
        v8.setFlagsFromString('--no-expose-gc');
    }
};

/** Runs a full major GC. Only meaningful for retention tests; never use it to paper over timing. */
export const forceGc = (): void => {
    gcFn ??= acquireGc();
    gcFn();
};

const countLive = (refs: WeakRef<object>[]): number => refs.filter((ref) => ref.deref() !== undefined).length;

/**
 * Number of `refs` still reachable once collection has settled. `settle` must yield to the event loop —
 * a WeakRef target survives the job that created it — and should flush any pending framework work.
 */
export const collectWeakRefsUntilStable = async (
    refs: WeakRef<object>[],
    settle: () => Promise<void>,
    maxPasses = 5
): Promise<number> => {
    let live = countLive(refs);
    for (let pass = 0; pass < maxPasses; pass++) {
        await settle();
        forceGc();
        const next = countLive(refs);
        if (next === live) {
            return next;
        }
        live = next;
    }
    return live;
};
