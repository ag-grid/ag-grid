import type { CanvasLike } from 'ag-charts-core';
import { ConfiguredCanvasMixin, applySkiaPatches } from 'ag-charts-core';

// skia-canvas ships a platform-specific native binary and is loaded lazily (inside `init()`, not at
// module scope) - this module is re-exported from test-utils/index.ts, which almost every behavioural
// test imports regardless of whether it touches charts, so a top-level import would require every
// test in the suite to have a working skia-canvas native binary, not just the ones that call `init`.
// Typed against `ConfiguredCanvasMixin`'s own fixed return shape (not skia-canvas's concrete `Canvas`
// type) so no skia-canvas type reference - which would need either a runtime import or the banned
// `import()` type syntax - is needed at module scope.
type ConfiguredCanvasInstance = CanvasLike & { transferToImageBitmap(): CanvasLike };
let NodeCanvas: (new (...args: any[]) => ConfiguredCanvasInstance) | undefined;
type NodeCanvasInstance = ConfiguredCanvasInstance;

let initialized = false;
let originalCreateElement: typeof document.createElement | undefined;
let originalGlobals: { Path2D: unknown; DOMMatrix: unknown; Image: unknown } | undefined;

/**
 * Opt-in: patches `document.createElement('canvas')` so each canvas element is backed by
 * `skia-canvas` (via `ag-charts-core`'s `ConfiguredCanvasMixin`/`applySkiaPatches`) and provides
 * globals (`Path2D`, `DOMMatrix`, `Image`) AG Charts' rendering layer expects. Mirrors the setup
 * `ag-charts-server-side` uses for its own SSR and image-snapshot tests — jsdom has no native
 * canvas support, so without this AG Charts can't construct a real chart. Call `init` in
 * `beforeAll` for tests that render real Integrated Charts, and `reset` in `afterAll` to restore
 * jsdom's defaults for other tests sharing the same worker.
 */
export const canvasPolyfill = {
    init,
    reset,
};

async function init(): Promise<boolean> {
    if (initialized) {
        return false;
    }
    initialized = true;

    const SkiaCanvas = await import('skia-canvas');
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
    originalGlobals = { Path2D: global.Path2D, DOMMatrix: global.DOMMatrix, Image: global.Image };
    Object.assign(global, { Path2D, DOMMatrix, Image });

    const canvases = new WeakMap<HTMLCanvasElement, NodeCanvasInstance>();
    originalCreateElement = document.createElement.bind(document);

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

function reset(): void {
    if (!initialized || !originalCreateElement || !originalGlobals) {
        return;
    }
    document.createElement = originalCreateElement;
    Object.assign(globalThis as unknown as Record<string, unknown>, originalGlobals);
    originalCreateElement = undefined;
    originalGlobals = undefined;
    initialized = false;
}
