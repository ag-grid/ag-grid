// A timed loop never yields to the timer queue, so work the grid defers (removed rows are destroyed 400ms later)
// would pile up across calls. Each call runs on a virtual clock instead: the call, then an idle gap whose due
// timers run in order, inside its measured time. Date.now() is real time, so a timer waiting on it would spin.

/** A call is an action and then a pause: long enough for the grid's deferred cleanup and re-checks to land. */
const IDLE_GAP_MS = 1000;
// A timer that keeps re-arming itself inside the gap would otherwise hang the bench.
const MAX_TIMERS_PER_GAP = 10_000;

interface VirtualTimer {
    due: number;
    callback: (...args: unknown[]) => void;
    args: unknown[];
}

type Gap = { agBenchIdleGap?: number };

export class VirtualClock {
    private now = 0;
    // Negative, so they never collide with a real timer's id; a Map keeps them in scheduling order.
    private nextId = 0;
    private readonly timers = new Map<number, VirtualTimer>();

    /** Runs `fn` and then its idle gap (`agBenchIdleGap`, set by the call, or IDLE_GAP_MS). */
    public run(fn: () => unknown): unknown {
        const gap = globalThis as Gap;
        gap.agBenchIdleGap = undefined;
        return this.withVirtualTimers(() => {
            const result = fn();
            if (result instanceof Promise) {
                throw new Error('a bench returning a promise must be an async function, so it runs on real timers');
            }
            this.advance(this.now + (gap.agBenchIdleGap ?? IDLE_GAP_MS));
            return result;
        });
    }

    /** Runs every pending timer, untimed, so the grid finishes its deferred work before it is torn down. */
    public flush(): void {
        this.withVirtualTimers(() => this.advance(Infinity));
    }

    private withVirtualTimers<T>(body: () => T): T {
        const realSetTimeout = window.setTimeout;
        const realClearTimeout = window.clearTimeout;
        const timers = this.timers;
        window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]): number => {
            if (typeof handler !== 'function') {
                return realSetTimeout(handler, delay, ...args);
            }
            const id = --this.nextId;
            timers.set(id, { due: this.now + Math.max(0, delay || 0), callback: handler as () => void, args });
            return id;
        }) as typeof window.setTimeout;
        window.clearTimeout = (id?: number): void => {
            if (!timers.delete(id!)) {
                realClearTimeout(id);
            }
        };
        try {
            return body();
        } finally {
            window.setTimeout = realSetTimeout;
            window.clearTimeout = realClearTimeout;
        }
    }

    private advance(end: number): void {
        for (let ran = 0; ; ++ran) {
            const next = this.nextDue(end);
            if (next === undefined) {
                break;
            }
            if (ran === MAX_TIMERS_PER_GAP) {
                throw new Error(`more than ${MAX_TIMERS_PER_GAP} timers in one idle gap: a timer keeps re-arming`);
            }
            const timer = this.timers.get(next)!;
            this.timers.delete(next);
            this.now = timer.due;
            timer.callback(...timer.args);
        }
        // A flush stops at its last timer, so the next call's gap still counts from a real moment.
        if (end !== Infinity) {
            this.now = end;
        }
    }

    /** The earliest timer due by `end`; ties go to the first scheduled, as real timers do. */
    private nextDue(end: number): number | undefined {
        let found: number | undefined;
        let due = end;
        for (const [id, timer] of this.timers) {
            if (timer.due < due || (found === undefined && timer.due === due)) {
                found = id;
                due = timer.due;
            }
        }
        return found;
    }
}
