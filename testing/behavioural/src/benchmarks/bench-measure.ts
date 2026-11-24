import type { Statistics } from 'tinybench';
import type { BaselineData } from 'vitest';
import { cdp, commands } from 'vitest/browser';

import { VirtualClock } from './virtual-clock';

// Every bench's measuring loop (`bench` in bench-utils.ts), reported through `bench.from`: vitest 5.1 cannot load a
// custom `benchmark.provider` in browser mode, where its runner has no module runner to import one with.

export interface BenchTurn {
    granted: boolean;
    paired: boolean;
    /** `./benches.sh --profile`: CPU-profile each bench's measured run. */
    profile: boolean;
}

declare module 'vitest/browser' {
    interface BrowserCommands {
        benchTurn: (name: string) => Promise<BenchTurn>;
        benchTurnWait: () => Promise<BenchTurn>;
        benchSamples: (name: string, slices: number[][]) => Promise<void>;
        benchProfile: (name: string, profile: string) => Promise<void>;
    }
}

/** Measured window (ms), the same for every bench: noise between processes (~3%) dwarfs a window's own (~1.5%). */
const WINDOW_MS = 500;
/** Warmup (ms): JIT tiers up on work done, so a fast bench needs the same time as a slow one, and at least WARMUP_CALLS. */
const WARMUP_MS = 250;
const WARMUP_CALLS = 10;

// Back-to-back slices in one turn (interleaving doubled the noise) give a within-run variance; one per CALLS_PER_SLICE
// warmup calls the window holds, so a disturbed stretch of a fast bench is a sixteenth of its run, not a quarter.
const MIN_SLICES = 4;
const MAX_SLICES = 16;
const CALLS_PER_SLICE = 8;
// Fine enough for a few hundred µs call to show its callees, coarse enough to keep the profile small.
const PROFILE_SAMPLING_US = 50;

/** Two-sided 95% Student's t for 1 to 30 degrees of freedom; past them, the normal's 1.96 is within 2%. */
const T_975 = [
    12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11,
    2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
];

// An async bench keeps the real clock: it awaits what its timers resolve.
const AsyncFunction = (async () => {}).constructor;

// Bound at import: the bench's own code may replace the global.
const now = performance.now.bind(performance);

type BenchFn = () => unknown;
/** Untimed, run before every call; async to let real frames and timers land, such as to release a large grid. */
export type BenchPrepare = () => void | Promise<void>;

/** A bench's untimed setup and teardown, each run once around its turn, and its window and warmup (ms) when not the default. */
export interface BenchOptions {
    setup?: () => Promise<void> | void;
    teardown?: () => Promise<void> | void;
    time?: number;
    warmupTime?: number;
    /** Minimum warmup calls (default 10). Lower it for a call that takes seconds, so warmup does not dominate the run. */
    warmupCalls?: number;
    /** The bench's test timeout (ms), when a call is slow enough that the default cap cannot hold its warmup and window. */
    timeout?: number;
}

/** Measures `fn` in this side's turn: warmup, then the sliced window, every call's time sent to bench-compare. */
export async function measureBench(name: string, fn: BenchFn, options: BenchOptions): Promise<BaselineData> {
    // Blocks until bench-compare hands this side the turn, so the other side is idle while it measures.
    let turn = await commands.benchTurn(name);
    while (!turn.granted) {
        turn = await commands.benchTurnWait();
    }
    // Read by benchCooldown: the other side's turn has already been this side's pause.
    (globalThis as { agBenchPaired?: boolean }).agBenchPaired = turn.paired;

    const clock = new VirtualClock();
    const prepare = (fn as { agBenchPrepare?: BenchPrepare }).agBenchPrepare;
    const call: BenchFn = fn.constructor === AsyncFunction ? fn : () => clock.run(fn);
    const slices: number[][] = [];
    let failure: unknown;
    await options.setup?.();
    try {
        let warmCalls = 0;
        let warmTime = 0;
        const warmupMs = options.warmupTime ?? WARMUP_MS;
        const minWarmCalls = options.warmupCalls ?? WARMUP_CALLS;
        while (warmCalls < minWarmCalls || warmTime < warmupMs) {
            warmTime += await timeCall(call, prepare, clock);
            ++warmCalls;
        }
        // Warmup's deferred work lands before the window, not in its first calls, and its garbage is collected.
        clock.flush();
        collectGarbage();
        // The warmup's mean call (an overestimate, as it includes the cold calls) sizes the slices.
        const windowMs = options.time ?? WINDOW_MS;
        const sliceCount = Math.min(
            MAX_SLICES,
            Math.max(MIN_SLICES, Math.floor((windowMs * warmCalls) / warmTime / CALLS_PER_SLICE))
        );
        const measureSlices = () => runSlices(slices, sliceCount, windowMs / sliceCount, call, prepare, clock);
        if (turn.profile) {
            await profiled(name, measureSlices);
        } else {
            await measureSlices();
        }
    } catch (error) {
        failure = error;
    }
    // Cleanup runs either way, but the bench's own error is the one reported.
    try {
        clock.flush();
        await options.teardown?.();
    } catch (error) {
        failure ??= error;
    }
    // In this side's turn, not by V8's idle-time GC once idle, on cores the other side is measuring with.
    collectGarbage();
    if (failure !== undefined) {
        throw failure;
    }
    const calls: number[] = [];
    const runLengths: number[][] = [];
    for (const slice of slices) {
        calls.push(...slice);
        runLengths.push(toRunLengths(slice.sort((a, b) => a - b)));
    }
    await commands.benchSamples(name, runLengths);
    return toResult(calls);
}

// A slice ends on an even call count past its cap, so a bench alternating a heavy and a light call gets as many of each.
async function runSlices(
    slices: number[][],
    sliceCount: number,
    sliceCap: number,
    call: BenchFn,
    prepare: BenchPrepare | undefined,
    clock: VirtualClock
): Promise<void> {
    for (let s = 0; s < sliceCount; ++s) {
        const slice: number[] = [];
        let sliceTime = 0;
        while (slice.length === 0 || (slice.length & 1) === 1 || sliceTime < sliceCap) {
            const duration = await timeCall(call, prepare, clock);
            slice.push(duration);
            sliceTime += duration;
        }
        slices.push(slice);
    }
}

/** One call's time; its `prepare` runs first, untimed: on the same virtual clock, or on real timers if it is async. */
async function timeCall(call: BenchFn, prepare: BenchPrepare | undefined, clock: VirtualClock): Promise<number> {
    if (prepare) {
        if (prepare.constructor === AsyncFunction) {
            await prepare();
        } else {
            clock.run(prepare);
        }
    }
    const start = now();
    const result = call();
    if (result instanceof Promise) {
        await result;
    }
    return now() - start;
}

/** The measured run only, not warmup or setup, so the call tree is the steady state the numbers come from. */
async function profiled(name: string, body: () => Promise<void>): Promise<void> {
    const session = cdp();
    await session.send('Profiler.enable');
    await session.send('Profiler.setSamplingInterval', { interval: PROFILE_SAMPLING_US });
    await session.send('Profiler.start');
    await body();
    const stopped = await session.send('Profiler.stop');
    await session.send('Profiler.disable');
    await commands.benchProfile(name, JSON.stringify(stopped.profile));
}

let gcMissingWarned = false;
/** `--expose-gc` is set in vitest.config.ts; without it every bench would silently skip its collections. */
function collectGarbage(): void {
    const gc = (globalThis as { gc?: () => void }).gc;
    if (gc) {
        gc();
    } else if (!gcMissingWarned) {
        gcMissingWarned = true;
        console.warn('bench-measure: window.gc is missing, so benches run without their forced collections');
    }
}

/** Sorted call times (ms) as `[value in 0.1µs, count, …]`: the 5µs timer leaves few distinct values. */
function toRunLengths(sorted: number[]): number[] {
    const out: number[] = [];
    let value = Math.round(sorted[0] * 1e4);
    let count = 0;
    for (let i = 0, len = sorted.length; i < len; ++i) {
        const next = Math.round(sorted[i] * 1e4);
        if (next !== value) {
            out.push(value, count);
            value = next;
            count = 0;
        }
        ++count;
    }
    out.push(value, count);
    return out;
}

/** Vitest's result for a bench, from every measured call (ms): what its table and the json reporter show. */
function toResult(calls: number[]): BaselineData {
    let totalTime = 0;
    for (let i = 0; i < calls.length; ++i) {
        totalTime += calls[i];
    }
    const latency = statistics(calls);
    // A call under the timer's resolution reads 0 ms; its throughput is the mean's, as tinybench does.
    const throughput = statistics(calls.map((ms) => (ms > 0 ? 1000 / ms : 1000 / latency.mean)));
    return { latency, throughput, period: totalTime / calls.length, totalTime };
}

function statistics(values: number[]): Statistics {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    let sum = 0;
    for (let i = 0; i < n; ++i) {
        sum += sorted[i];
    }
    const mean = sum / n;
    let squares = 0;
    let absolute = 0;
    for (let i = 0; i < n; ++i) {
        const deviation = sorted[i] - mean;
        squares += deviation * deviation;
        absolute += Math.abs(deviation);
    }
    const df = n - 1;
    const variance = df > 0 ? squares / df : 0;
    const sd = Math.sqrt(variance);
    const sem = sd / Math.sqrt(n);
    const critical = T_975[df - 1] ?? 1.96;
    const moe = sem * critical;
    const p50 = quantile(sorted, 0.5);
    const deviations = sorted.map((v) => Math.abs(v - p50)).sort((a, b) => a - b);
    return {
        aad: absolute / n,
        critical,
        df,
        mad: quantile(deviations, 0.5),
        max: sorted[n - 1],
        mean,
        min: sorted[0],
        moe,
        p50,
        p75: quantile(sorted, 0.75),
        p99: quantile(sorted, 0.99),
        p995: quantile(sorted, 0.995),
        p999: quantile(sorted, 0.999),
        rme: mean === 0 ? Infinity : (100 * moe) / Math.abs(mean),
        samples: undefined,
        samplesCount: n,
        sd,
        sem,
        variance,
    };
}

/** Linearly interpolated quantile `q` of sorted values. */
function quantile(sorted: number[], q: number): number {
    const position = (sorted.length - 1) * q;
    const below = Math.floor(position);
    const above = Math.ceil(position);
    return sorted[below] + (sorted[above] - sorted[below]) * (position - below);
}
