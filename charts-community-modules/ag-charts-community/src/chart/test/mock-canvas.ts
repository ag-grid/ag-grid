import { Canvas, createCanvas, Image } from 'canvas';

export class MockContext {
    realCreateElement: typeof document.createElement;
    ctx: { nodeCanvas: Canvas };
    canvasStack: Canvas[];
    canvases: Canvas[];

    constructor(width = 1, height = 1, realCreateElement: typeof document.createElement = document.createElement) {
        const nodeCanvas = createCanvas(width, height);

        this.realCreateElement = realCreateElement;
        this.ctx = { nodeCanvas };
        this.canvasStack = [nodeCanvas];
        this.canvases = [nodeCanvas];
    }

    destroy() {
        (this as any).ctx.nodeCanvas = undefined;
        (this as any).realCreateElement = undefined;
        this.canvasStack = [];
        this.canvases = [];
    }
}

export function setup({ width = 800, height = 600, mockCtx = new MockContext() } = {}) {
    const nodeCanvas = createCanvas(width, height);
    mockCtx.ctx.nodeCanvas = nodeCanvas;
    mockCtx.canvasStack = [nodeCanvas];

    if (typeof window !== 'undefined') {
        (window as any)['agChartsSceneRenderModel'] = 'composite';
    } else {
        (global as any)['agChartsSceneRenderModel'] = 'composite';
    }

    const realCreateElement = document.createElement;
    mockCtx.realCreateElement = realCreateElement;

    (document as any).createElement = (element: any, options: any) => {
        if (element === 'canvas') {
            const mockedElement = realCreateElement.call(document, element, options) as HTMLCanvasElement;

            let [nextCanvas] = mockCtx.canvasStack.splice(0, 1);
            if (!nextCanvas) {
                nextCanvas = createCanvas(width, height);
            }
            mockCtx.canvases.push(nextCanvas);

            mockedElement.getContext = (type: any) => {
                const context2d = nextCanvas.getContext(type, { alpha: true });
                context2d.patternQuality = 'good';
                context2d.quality = 'good';
                context2d.textDrawingMode = 'path';
                context2d.antialias = 'subpixel';

                return context2d as any;
            };

            return mockedElement;
        } else if (element === 'img') {
            return new Image();
        }

        return realCreateElement.call(document, element, options);
    };

    return mockCtx;
}

export function teardown(mockContext: MockContext) {
    document.createElement = mockContext.realCreateElement!;
    mockContext.destroy();
}
