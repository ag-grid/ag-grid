import { _doOnce } from 'ag-stack';
import type { BenchOptions } from 'vitest';
import { bench } from 'vitest';

import type { GridApi, GridOptions, Module, Params } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';

import { ignoreConsoleLicenseKeyError } from '../test-utils/ignoreConsoleLicenseKeyError';

// Benchmarks use standard vitest `bench`/`suite` and import grid helpers from here (never the
// `../test-utils` barrel, which pulls in node-only helpers and jsdom-coupled machinery that break
// the real-browser runner). There is no jsdom layout faker — benchmarks measure real layout or none.
export type { BenchOptions };
export { SimplePRNG } from '../test-utils/prng';

/** True under the jsdom bench environment, false in a real browser (`./benches.sh --browser`). */
export const IS_JSDOM = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');

// A modest bump over tinybench's defaults (time 500ms, warmup 100ms): sample a bit longer. Scale up per-bench via noiseFactor.
const BASE_TIME = 1000;
const BASE_WARMUP = 150;

// `--profile` (BENCH_PROFILE) wants a representative call tree, not a tight confidence interval — so
// keep runs short regardless of noiseFactor, to keep the .cpuprofile small and the run quick.
const IS_PROFILING = typeof process !== 'undefined' && !!process.env?.BENCH_PROFILE;
const PROFILE_TIME = 400;
const PROFILE_WARMUP = 50;

export interface AgBenchOptions extends BenchOptions {
    /** Scales warmup + measured time (e.g. 2–4) to tighten a noisy bench's confidence interval; default 1. */
    noiseFactor?: number;
}

/**
 * Precision defaults for a `bench()`: `bench(name, fn, benchDefaults({ setup }))`. For a noisy bench
 * set `noiseFactor` — `benchDefaults({ noiseFactor: 3, setup })` — to scale warmup + measured time up.
 */
export function benchDefaults({ noiseFactor, ...overrides }: AgBenchOptions = {}): BenchOptions {
    noiseFactor ||= 1;
    if (IS_PROFILING) {
        // Force short timing (overriding noiseFactor) but keep setup/teardown; iteration floors of 1
        // let the short `time` bound stop slow benches early instead of forcing many iterations.
        return {
            throws: true,
            ...overrides,
            warmupTime: PROFILE_WARMUP,
            warmupIterations: 1,
            time: PROFILE_TIME,
            iterations: 1,
        };
    }
    return { throws: true, warmupTime: BASE_WARMUP * noiseFactor, time: BASE_TIME * noiseFactor, ...overrides };
}

export interface BenchGridManagerOptions {
    /** Modules registered on every grid. Benchmarks declare exactly what they need — no defaults. */
    modules?: Module[] | null | undefined;
}

// Production-like default so benchmarks measure real rendering, not a test shortcut.
const benchmarkGridOptions: GridOptions = {};

interface LiveGrid {
    api: GridApi;
    element: HTMLElement;
}

/** Lean grids manager for benchmarks: creates a viewport-filling, themed container; runs in jsdom or a real browser. */
export class BenchGridsManager {
    private readonly modules: Module[];
    private readonly grids: LiveGrid[] = [];

    public constructor(options: BenchGridManagerOptions = {}) {
        this.modules = options.modules ?? [];
    }

    /** Destroy every grid this manager created and drop their containers — call between iterations. */
    public reset(): void {
        const grids = this.grids;
        for (let i = 0, len = grids.length; i < len; ++i) {
            grids[i].api.destroy();
            grids[i].element.remove();
        }
        grids.length = 0;
        _doOnce._set.clear();
        // Reclaim the destroyed grids now, so their garbage doesn't trigger a GC pause mid-measurement
        // in the next bench. gc is exposed by the vitest config (node forks + browser js-flags).
        (globalThis as { gc?: () => void }).gc?.();
    }

    public createGrid<TData = any>(id: string, gridOptions: GridOptions, params?: Params): GridApi<TData> {
        // Always own a fresh container, sized to fill the (fixed) browser viewport so the grid
        // renders a representative number of rows and, headed, is visible. jsdom has no layout, so
        // this is inert there.
        const element = document.createElement('div');
        element.id = id;
        const style = element.style;
        style.width = '100vw';
        style.height = '100vh';
        const body = document.body;
        body.style.margin = '0';
        body.appendChild(element);

        ignoreConsoleLicenseKeyError();

        const modules = params?.modules ? [...this.modules, ...params.modules] : this.modules;
        const api = createGrid<TData>(element, { ...benchmarkGridOptions, ...gridOptions }, { ...params, modules });

        // Compact bean serialisation so a failing expect() diff doesn't OOM on the cyclic bean graph.
        this.grids.push({ api, element });

        return api;
    }
}

let benchGridSeq = 0;

/**
 * A `bench` that alternates `forwardFn` / `reverseFn` on each iteration against a freshly-created
 * grid. Alternating (vs a forward+reverse round-trip per iteration) halves per-iteration cost,
 * doubling the sample count for the same measured time. The grid is (re)created in `setup` and
 * reclaimed via `gridsManager.reset()`; `noiseFactor` scales sampling for a noisy bench.
 */
export function benchAlternating(
    gridsManager: BenchGridsManager,
    name: string,
    gridOptions: GridOptions,
    initialData: any[],
    forwardFn: (api: GridApi) => void,
    reverseFn: (api: GridApi) => void,
    noiseFactor = 1
): void {
    const id = `bench-grid-${++benchGridSeq}`;
    let api!: GridApi;
    let forward = true;
    bench(
        name,
        () => {
            if (forward) {
                forwardFn(api);
            } else {
                reverseFn(api);
            }
            forward = !forward;
        },
        {
            ...benchDefaults({ noiseFactor }),
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, { ...gridOptions, rowData: initialData });
                forward = true;
            },
        }
    );
}
