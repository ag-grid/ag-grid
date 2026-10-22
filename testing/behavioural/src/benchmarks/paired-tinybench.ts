import { Task as TinybenchTask } from 'tinybench';
import { cdp, commands } from 'vitest/browser';

import { VirtualClock } from './virtual-clock';

// Served in place of `tinybench` for every browser bench run (see vitest.config.ts): hooking the runner's
// Task reaches every bench, whatever its own setup/options look like.
export * from 'tinybench';

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

// Slices run back to back in one turn (interleaving them between the sides doubled the noise) and give each bench a
// within-run variance and an A/A check. One per CALLS_PER_SLICE warmup calls the window holds, so a disturbed stretch
// of a fast bench is a sixteenth of its run, not a quarter.
const MIN_SLICES = 4;
const MAX_SLICES = 16;
const CALLS_PER_SLICE = 8;
// JIT tiers up on work done, not on calls, so warmup runs the bench's warmupTime, and a slow bench WARMUP_CALLS too.
const WARMUP_CALLS = 10;
// Fine enough for a few hundred µs call to show its callees, coarse enough to keep the profile small.
const PROFILE_SAMPLING_US = 50;

type Phase = 'idle' | 'warmup' | 'run';

// tinybench's own test for an async bench, which keeps the real clock: it awaits what its timers resolve.
const AsyncFunction = (async () => {}).constructor;

let gcMissingWarned = false;
/** `--expose-gc` is set in vitest.config.ts; without it every bench would silently skip its collections. */
function collectGarbage(): void {
    const gc = (globalThis as { gc?: () => void }).gc;
    if (gc) {
        gc();
    } else if (!gcMissingWarned) {
        gcMissingWarned = true;
        console.warn('paired-tinybench: window.gc is missing, so benches run without their forced collections');
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

export class Task extends TinybenchTask {
    private phase: Phase = 'idle';
    private warmupCap = 0;
    private window = 0;
    private sliceCount = MIN_SLICES;
    private sliceCap = 0;
    private warmCalls = 0;
    private warmTime = 0;
    private slice = 0;
    private sliceTime = 0;
    private advance = false;
    private slices: number[][] = [];
    private teardownOnce: () => void | Promise<void> = () => {};
    private profile = false;
    private readonly clock = new VirtualClock();

    public override async warmup(): Promise<void> {
        // Blocks until bench-compare hands this side the turn, so the other side is idle while it measures.
        let turn = await commands.benchTurn(this.name);
        while (!turn.granted) {
            turn = await commands.benchTurnWait();
        }
        // Read by benchCooldown: the other side's turn has already been this side's pause.
        (globalThis as { agBenchPaired?: boolean }).agBenchPaired = turn.paired;
        this.profile = turn.profile;

        // tinybench loops while (time || iterations) are unmet and `signal.aborted` is false, re-reading
        // the signal before every call; a run that ends aborted is dropped, so afterAll clears the phase.
        const bench = this.bench;
        // One setup and one awaited teardown per bench: tinybench sets up again for the run and never awaits a
        // teardown, so a heavy grid was built twice and could be torn down under the next measurement.
        const setup = bench.setup;
        const teardown = bench.teardown;
        bench.setup = (task, mode) => (mode === 'warmup' ? setup.call(bench, task, mode) : undefined);
        bench.teardown = () => {};
        this.teardownOnce = () => teardown.call(bench, this, 'run');
        const fn = this.fn;
        const prepare = (fn as { agBenchPrepare?: () => void }).agBenchPrepare;
        if (fn.constructor !== AsyncFunction) {
            this.fn = () => this.clock.run(() => fn.call(this));
        }
        this.warmupCap = bench.warmupTime;
        this.window = bench.time;
        bench.warmupIterations = Math.max(bench.warmupIterations, WARMUP_CALLS);
        bench.time = Infinity;
        // tinybench reads only `aborted`, before every call; no real AbortSignal can compute it.
        const signal = {};
        Object.defineProperty(signal, 'aborted', { get: () => this.shouldStop() });
        bench.signal = signal as AbortSignal;
        // Call times in order, which tinybench does not keep: it sorts them once the run is over.
        const benchNow = bench.now;
        let started = -1;
        bench.now = () => {
            const now = benchNow.call(bench);
            if (started < 0) {
                started = now;
            } else {
                this.record(now - started);
                started = -1;
            }
            return now;
        };
        this.opts = {
            ...this.opts,
            beforeAll: () => this.startPhase(),
            // Before each call's clock starts, so neither a slice boundary nor the bench's prepare is measured.
            beforeEach: () => {
                this.nextSlice();
                if (prepare) {
                    this.clock.run(prepare);
                }
            },
            afterAll: () => {
                this.phase = 'idle';
            },
        };

        this.phase = 'warmup';
        await super.warmup();
    }

    public override async run(): Promise<this> {
        this.phase = 'run';
        let failure: unknown;
        try {
            // Warmup's deferred work lands before the window, not in its first calls.
            this.clock.flush();
            // Setup's and warmup's garbage is collected before the window opens, the same for every bench.
            collectGarbage();
            if (this.profile) {
                await this.runProfiled();
            } else {
                await super.run();
            }
        } catch (error) {
            failure = error;
        }
        // Cleanup runs either way, but the bench's own error is the one reported.
        try {
            this.clock.flush();
            await this.teardownOnce();
        } catch (error) {
            failure ??= error;
        }
        // In this side's turn, not by V8's idle-time GC once idle, on cores the other side is measuring with.
        collectGarbage();
        if (failure !== undefined) {
            throw failure;
        }
        const slices = this.slices;
        if (slices.length && !this.result?.error) {
            let recorded = 0;
            for (let i = 0; i < slices.length; ++i) {
                recorded += slices[i].length;
            }
            // The slices hook tinybench 2.x's loop: a tinybench calling it differently must not send mis-sliced calls.
            if (recorded !== this.runs) {
                console.error(`paired-tinybench: ${this.name}: ${recorded} calls sliced, tinybench ran ${this.runs}`);
                this.slices = [];
                return this;
            }
            const runLengths: number[][] = [];
            for (let i = 0; i < slices.length; ++i) {
                runLengths.push(toRunLengths(slices[i].sort((a, b) => a - b)));
            }
            this.slices = [];
            await commands.benchSamples(this.name, runLengths);
        }
        return this;
    }

    /** The measured run only, not warmup or setup, so the call tree is the steady state the numbers come from. */
    private async runProfiled(): Promise<void> {
        const session = cdp();
        await session.send('Profiler.enable');
        await session.send('Profiler.setSamplingInterval', { interval: PROFILE_SAMPLING_US });
        await session.send('Profiler.start');
        await super.run();
        const stopped = await session.send('Profiler.stop');
        await session.send('Profiler.disable');
        await commands.benchProfile(this.name, JSON.stringify(stopped.profile));
    }

    private startPhase(): void {
        if (this.phase === 'run') {
            // The warmup's mean call (an overestimate, as it includes the cold calls) sizes the slices.
            const meanCall = this.warmCalls > 0 ? this.warmTime / this.warmCalls : this.window;
            const slices = Math.floor(this.window / meanCall / CALLS_PER_SLICE);
            this.sliceCount = Math.min(MAX_SLICES, Math.max(MIN_SLICES, slices));
            this.sliceCap = this.window / this.sliceCount;
        }
        this.warmCalls = 0;
        this.warmTime = 0;
        this.slice = 0;
        this.sliceTime = 0;
        this.advance = false;
        this.slices = this.phase === 'run' ? [[]] : [];
    }

    private record(duration: number): void {
        if (this.phase === 'warmup') {
            this.warmCalls++;
            this.warmTime += duration;
        } else if (this.phase === 'run') {
            this.slices[this.slice].push(duration);
            this.sliceTime += duration;
        }
    }

    // A slice ends on an even call count, so a bench alternating a heavy and a light call gets as many of each.
    private shouldStop(): boolean {
        if (this.phase === 'warmup') {
            return this.warmCalls >= WARMUP_CALLS && this.warmTime >= this.warmupCap;
        }
        if (this.phase !== 'run' || this.advance) {
            return false;
        }
        const calls = this.slices[this.slice].length;
        if (calls === 0 || (calls & 1) === 1 || this.sliceTime < this.sliceCap) {
            return false;
        }
        if (this.slice === this.sliceCount - 1) {
            return true;
        }
        this.advance = true;
        return false;
    }

    private nextSlice(): void {
        if (!this.advance) {
            return;
        }
        this.advance = false;
        this.slice++;
        this.sliceTime = 0;
        this.slices.push([]);
    }
}
