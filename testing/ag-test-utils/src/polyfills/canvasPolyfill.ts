import type { CanvasLike } from 'ag-charts-core';

// Both runtime deps are loaded lazily (inside `init()`, not at module scope) - this module is
// re-exported from test-utils/index.ts, which almost every behavioural test imports regardless of
// whether it touches charts. skia-canvas ships a platform-specific native binary, so a top-level
// import would require every test in the suite to have a working one, not just the ones that call
// `init`; ag-charts-core is 405KB that node then evaluates in all 580 workers to serve the seven
// files that render a real chart.
// Typed against `ConfiguredCanvasMixin`'s own fixed return shape (not skia-canvas's concrete `Canvas`
// type) so no skia-canvas type reference - which would need either a runtime import or the banned
// `import()` type syntax - is needed at module scope.
type ConfiguredCanvasInstance = CanvasLike & { transferToImageBitmap(): CanvasLike };
let NodeCanvas: (new (...args: any[]) => ConfiguredCanvasInstance) | undefined;
type NodeCanvasInstance = ConfiguredCanvasInstance;

let initialized = false;
let originalCreateElement: typeof document.createElement | undefined;
/** Descriptors, not values: a global that was absent must go back to absent, or a later
 *  `'OffscreenCanvas' in globalThis` feature test answers yes for the rest of the worker. */
let originalGlobals: [string, PropertyDescriptor | undefined][] | undefined;
let originalSizeDescriptors: [DimensionProp, PropertyDescriptor | undefined][] | undefined;

const PATCHED_GLOBALS = ['Path2D', 'DOMMatrix', 'Image', 'OffscreenCanvas'] as const;

/** The chart's container is `.ag-chart-canvas-wrapper` (`GridChartComp`'s `eChart`). */
const CHART_CONTAINER_CLASS = 'ag-chart-canvas-wrapper';

type DimensionProp = keyof typeof MOCK_CHART_SIZE;

/**
 * Size the mocked chart container reports. Roughly a docked chart panel, and large enough that a
 * cartesian chart lays out axes and labels rather than collapsing to its minimums.
 */
const MOCK_CHART_SIZE = { clientWidth: 600, clientHeight: 400 };

/**
 * happy-dom pins `clientWidth`/`clientHeight` at 0, so the chart never gets a size and
 * `Chart.checkFirstAutoSize()` burns its whole 500ms timeout on every layout-level update.
 */
/** Installed after `mockGridLayout.init()` (a grid manager is constructed in the describe body, this runs in
 *  `beforeAll`), so the descriptor captured here is the grid mock's and `reset` hands it back. */
function mockChartContainerSize(): void {
    originalSizeDescriptors = [];
    for (const prop of ['clientWidth', 'clientHeight'] as const) {
        // Own descriptor for the restore, inherited one for the delegate: the DOM defines these on
        // `Element.prototype`, so shadowing them here without walking up would pin every other element at 0.
        const own = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
        const inherited = own ?? findInheritedDescriptor(prop);
        originalSizeDescriptors.push([prop, own]);
        Object.defineProperty(HTMLElement.prototype, prop, {
            configurable: true,
            get(this: HTMLElement) {
                // This element only, not `closest`: AG Charts auto-sizes from the wrapper, and sizing its
                // descendants too would hand every canvas and overlay a layout happy-dom never gave them. A
                // class check rather than `matches`, since every dimension read in the suite pays for it.
                return this.classList.contains(CHART_CONTAINER_CLASS)
                    ? MOCK_CHART_SIZE[prop]
                    : (inherited?.get?.call(this) ?? 0);
            },
        });
    }
}

function findInheritedDescriptor(prop: DimensionProp): PropertyDescriptor | undefined {
    let proto: object | null = Object.getPrototypeOf(HTMLElement.prototype);
    while (proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
        if (descriptor) {
            return descriptor;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return undefined;
}

/**
 * Opt-in: patches `document.createElement('canvas')` so each canvas element is backed by
 * `skia-canvas` (via `ag-charts-core`'s `ConfiguredCanvasMixin`/`applySkiaPatches`) and provides
 * globals (`Path2D`, `DOMMatrix`, `Image`, `OffscreenCanvas`) AG Charts' rendering layer expects.
 * Mirrors the setup
 * `ag-charts-server-side` uses for its own SSR and image-snapshot tests — happy-dom has no native
 * canvas support, so without this AG Charts can't construct a real chart. Call `init` in
 * `beforeAll` for tests that render real Integrated Charts, and `reset` in `afterAll` to restore
 * the environment's defaults for other tests sharing the same worker.
 */
export const canvasPolyfill = {
    init,
    reset,
};

async function init(): Promise<boolean> {
    if (initialized) {
        return false;
    }
    // Set before the awaits so a second caller cannot install the patches twice, and rolled back below if
    // setup throws: leaving it true with no saved globals wedges `reset()` and every later `init()`.
    initialized = true;
    try {
        return await install();
    } catch (error) {
        // Whatever `install` had already patched before it threw, restored: a half-installed polyfill
        // stays with the worker, and the next `init()` would then save the patched state as the original.
        reset();
        throw error;
    }
}

async function install(): Promise<boolean> {
    const [SkiaCanvas, { ConfiguredCanvasMixin, applySkiaPatches }] = await Promise.all([
        import('skia-canvas'),
        import('ag-charts-core'),
    ]);
    const { Canvas, DOMMatrix, Image, Path2D } = SkiaCanvas;
    // Destructured off the namespace import (rather than a named import, which collides with the DOM
    // lib global of the same name under `isolatedModules`) - skia-canvas exports this as a class but
    // its types don't reflect that on the namespace, hence the cast.
    const { CanvasRenderingContext2D } = SkiaCanvas as unknown as {
        CanvasRenderingContext2D: { prototype: CanvasRenderingContext2D };
    };
    applySkiaPatches(CanvasRenderingContext2D, DOMMatrix);
    NodeCanvas = ConfiguredCanvasMixin(Canvas);

    const global = globalThis as unknown as Record<string, unknown>;
    originalGlobals = PATCHED_GLOBALS.map((name): [string, PropertyDescriptor | undefined] => [
        name,
        Object.getOwnPropertyDescriptor(global, name),
    ]);
    // AG Charts measures text through `new OffscreenCanvas(w, h).getContext('2d')`, which happy-dom has no
    // implementation of - without it every layout pass that measures a label throws.
    Object.assign(global, { Path2D, DOMMatrix, Image, OffscreenCanvas: NodeCanvas });

    const canvases = new WeakMap<HTMLCanvasElement, NodeCanvasInstance>();
    // Before the size patch, because `reset()` keys off this being set: patching first would leave the
    // prototype rewritten for the rest of the worker if anything in between threw.
    originalCreateElement = document.createElement.bind(document);

    mockChartContainerSize();

    document.createElement = ((tagName: string, options?: ElementCreationOptions): HTMLElement => {
        const element = originalCreateElement!(tagName, options);
        if (tagName.toLowerCase() !== 'canvas') {
            return element;
        }

        const canvasEl = element as HTMLCanvasElement;
        const originalGetContext = canvasEl.getContext.bind(canvasEl);
        Object.defineProperty(canvasEl, 'getContext', {
            value: (contextType: string, ...args: any[]) => {
                if (contextType !== '2d') {
                    return originalGetContext(contextType as '2d', ...args);
                }
                let nodeCanvas = canvases.get(canvasEl);
                if (!nodeCanvas || nodeCanvas.width !== canvasEl.width || nodeCanvas.height !== canvasEl.height) {
                    nodeCanvas = new NodeCanvas!(canvasEl.width || 1, canvasEl.height || 1);
                    canvases.set(canvasEl, nodeCanvas);
                }
                return nodeCanvas.getContext('2d');
            },
            writable: true,
            configurable: true,
        });

        return canvasEl;
    }) as typeof document.createElement;

    return true;
}

// Each half is restored on its own rather than behind one guard, so this also undoes a partial install.
function reset(): void {
    if (originalCreateElement) {
        document.createElement = originalCreateElement;
        originalCreateElement = undefined;
    }
    for (const [name, descriptor] of originalGlobals ?? []) {
        restoreProperty(globalThis, name, descriptor);
    }
    for (const [prop, descriptor] of originalSizeDescriptors ?? []) {
        // Nothing of its own before: dropping the shim is what makes the inherited Element.prototype
        // getter visible again.
        restoreProperty(HTMLElement.prototype, prop, descriptor);
    }
    originalSizeDescriptors = undefined;
    originalGlobals = undefined;
    initialized = false;
}

function restoreProperty(target: object, name: string, descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) {
        Object.defineProperty(target, name, descriptor);
    } else {
        Reflect.deleteProperty(target, name);
    }
}
