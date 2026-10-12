import { _doOnce } from 'ag-stack';
import { ignoreConsoleLicenseKeyError } from 'ag-test-utils/ignoreKnownNoise';
import type { BenchOptions } from 'vitest';
import { bench } from 'vitest';

import type { GridApi, GridOptions, Module, Params } from 'ag-grid-community';
import { RenderApiModule, createGrid } from 'ag-grid-community';

// Benchmarks use standard vitest `bench`/`suite` and import grid helpers from here (never the
// `ag-test-utils` barrel, which pulls in node-only helpers and DOM-mock machinery that break the
// real-browser runner). There is no layout faker — benchmarks measure real layout or none.
export type { BenchOptions };
export { SimplePRNG } from 'ag-test-utils/prng';

// A timed loop never yields a frame, so the CSS transitions it starts never finish and pile up, each call
// costing more than the last (4x over 5000 column moves). At zero length none is ever created.
const noTransitions = document.createElement('style');
noTransitions.textContent =
    '*, *::before, *::after { transition-duration: 0s !important; transition-delay: 0s !important; ' +
    'animation-duration: 0s !important; animation-delay: 0s !important; }';
document.head.appendChild(noTransitions);

/** Pause (ms) run in each bench's setup so a previous bench's heat/garbage doesn't bleed into the next. */
const BENCH_COOLDOWN_MS = 50;
// Taken at import, before the virtual clock can ever swap the global: a virtual cooldown would never resolve.
const realSetTimeout = window.setTimeout;

/**
 * Brief cooldown between benches — `await` it at the start of a bench `setup` to let the CPU/GC settle.
 * Skipped when paired: this side just sat out the other's whole turn, and the pause would cost both sides.
 */
export const benchCooldown = (): Promise<void> =>
    (globalThis as { agBenchPaired?: boolean }).agBenchPaired
        ? Promise.resolve()
        : new Promise((resolve) => realSetTimeout(resolve, BENCH_COOLDOWN_MS));

/** Measured window (ms), the same for every bench: noise between processes (~3%) dwarfs a window's own (~1.5%). */
const BASE_TIME = 500;

/** Warmup (ms): JIT tiers up on work done, so a fast bench needs the same time as a slow one. */
const WARMUP_TIME = 250;

/** Window and warmup defaults for a `bench()`: `bench(name, fn, benchDefaults({ setup }))`. */
export function benchDefaults(overrides: BenchOptions = {}): BenchOptions {
    return { throws: true, warmupTime: WARMUP_TIME, time: BASE_TIME, ...overrides };
}

/** A scroll gesture's steps are a frame apart, so its scroll-end and re-check timers wait for the gesture to end. */
const FRAME_MS = 16;

/** One step of a scroll gesture, through the real listener: dragging a scrollbar is a scroll event, not an api call. */
export function scrollStep(viewport: HTMLElement, left: number, top: number): void {
    viewport.scrollLeft = left;
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event('scroll'));
    // Read by the virtual clock (virtual-clock.ts): the idle gap after this call.
    (globalThis as { agBenchIdleGap?: number }).agBenchIdleGap = FRAME_MS;
}

/** Step `i` of a gesture sweeping 0…steps−1 and back, so every call is one step: never a jump back to the start. */
export const sweep = (i: number, steps = 20): number => {
    const k = i % (2 * steps - 2);
    return k < steps ? k : 2 * steps - 2 - k;
};

/**
 * A bench fn whose every call starts with an untimed `prepare`, so a call measures one operation from the state
 * it needs rather than also undoing the previous call. `prepare` runs on the virtual clock too, idle gap included.
 */
export function untimedPrepare<T extends () => unknown>(prepare: () => void, measure: T): T {
    return Object.assign(measure, { agBenchPrepare: prepare });
}

export interface BenchGridManagerOptions {
    /** Modules registered on every grid. Benchmarks declare exactly what they need — no defaults. */
    modules?: Module[] | null | undefined;
}

// Production-like default so benchmarks measure real rendering, not a test shortcut.
const benchmarkGridOptions: GridOptions = {};

// Every manager, so a bench's reset also destroys the grid another suite of its file left behind.
const managers = new Set<BenchGridsManager>();

interface LiveGrid {
    api: GridApi;
    element: HTMLElement;
}

/** Lean grids manager for benchmarks: creates a viewport-filling, themed container; in a real browser. */
export class BenchGridsManager {
    private readonly modules: Module[];
    private readonly grids: LiveGrid[] = [];

    public constructor(options: BenchGridManagerOptions = {}) {
        this.modules = options.modules ?? [];
        managers.add(this);
    }

    /** Destroy every grid this manager created. Synchronous: no cooldown, that is `reset()`'s. */
    public destroyAll(): void {
        const grids = this.grids;
        for (let i = 0, len = grids.length; i < len; ++i) {
            grids[i].api.destroy();
            grids[i].element.remove();
        }
        grids.length = 0;
        _doOnce._set.clear();
    }

    /** Destroy every manager's grids, then cool down. `await` it at the start of each `setup`. */
    public async reset(): Promise<void> {
        for (const manager of managers) {
            manager.destroyAll();
        }
        await benchCooldown();
    }

    public createGrid<TData = any>(id: string, gridOptions: GridOptions, params?: Params): GridApi<TData> {
        // Always own a fresh container, sized to fill the (fixed) browser viewport so the grid
        // renders a representative number of rows and, headed, is visible.
        const element = document.createElement('div');
        element.id = id;
        const style = element.style;
        style.width = '100vw';
        style.height = '100vh';
        const body = document.body;
        body.style.margin = '0';
        body.appendChild(element);

        ignoreConsoleLicenseKeyError();

        // RenderApiModule is always registered: the bench helpers call api.flushAllAnimationFrames()
        // after each mutation, which is a no-op (and logs error #200) without it.
        const modules = [...this.modules, ...(params?.modules ?? []), RenderApiModule];
        const api = createGrid<TData>(element, { ...benchmarkGridOptions, ...gridOptions }, { ...params, modules });

        // Track for teardown in reset().
        this.grids.push({ api, element });

        return api;
    }
}

let benchGridSeq = 0;

/** Alternates `forwardFn` / `reverseFn` per call: half a round trip each, so twice the calls in the window. */
export function benchAlternating(
    gridsManager: BenchGridsManager,
    name: string,
    gridOptions: GridOptions,
    initialData: any[],
    forwardFn: (api: GridApi) => void,
    reverseFn: (api: GridApi) => void
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
            // Flush the deferred render so each call measures its own, not a later call's as a spike.
            api.flushAllAnimationFrames();
            forward = !forward;
        },
        {
            ...benchDefaults(),
            setup: async () => {
                await gridsManager.reset();
                api = gridsManager.createGrid(id, { ...gridOptions, rowData: initialData });
                forward = true;
            },
        }
    );
}

/** A `bench` building the grid's rows from empty; the emptying before each call is untimed. */
export function benchRebuild(
    gridsManager: BenchGridsManager,
    name: string,
    gridOptions: GridOptions,
    rowData: any[]
): void {
    const id = `bench-grid-${++benchGridSeq}`;
    let api!: GridApi;
    bench(
        name,
        rebuildRows(() => api, rowData),
        {
            ...benchDefaults(),
            setup: async () => {
                await gridsManager.reset();
                api = gridsManager.createGrid(id, { ...gridOptions, rowData: [] });
            },
        }
    );
}

/** A bench fn setting `rowData` on a grid emptied, untimed, before every call. */
export function rebuildRows(getApi: () => GridApi, rowData: any[]): () => void {
    return untimedPrepare(
        () => {
            const api = getApi();
            api.setGridOption('rowData', []);
            api.flushAllAnimationFrames();
        },
        () => {
            const api = getApi();
            api.setGridOption('rowData', rowData);
            api.flushAllAnimationFrames();
        }
    );
}
