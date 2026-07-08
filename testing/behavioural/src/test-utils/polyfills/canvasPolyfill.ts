import { ConfiguredCanvasMixin, applySkiaPatches } from 'ag-charts-core';
import { Canvas, CanvasRenderingContext2D, DOMMatrix, Image, Path2D } from 'skia-canvas';

const NodeCanvas = ConfiguredCanvasMixin(Canvas);
type NodeCanvasInstance = InstanceType<typeof NodeCanvas>;

applySkiaPatches(CanvasRenderingContext2D, DOMMatrix);

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

function init(): boolean {
    if (initialized) {
        return false;
    }
    initialized = true;

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
                    nodeCanvas = new NodeCanvas(canvasEl.width || 1, canvasEl.height || 1);
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
