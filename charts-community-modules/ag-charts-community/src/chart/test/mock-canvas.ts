import { Canvas, createCanvas, Image } from 'canvas';

export class MockContext {
    realCreateElement: typeof document.createElement;
    ctx: { nodeCanvas?: Canvas } = {};
    canvasStack: Canvas[] = [];
    canvases: Canvas[] = [];
}

export function setup({ mockCtx = new MockContext(), width = 800, height = 600 } = {}) {
    const nodeCanvas = createCanvas(width, height);
    mockCtx.ctx.nodeCanvas = nodeCanvas;
    mockCtx.canvasStack = [nodeCanvas];

    if (typeof window !== 'undefined') {
        window['agChartsSceneRenderModel'] = 'composite';
    } else {
        global['agChartsSceneRenderModel'] = 'composite';
    }

    const realCreateElement = document.createElement;
    mockCtx.realCreateElement = realCreateElement;

    document.createElement = (element, options) => {
        if (element === 'canvas') {
            const mockedElement: HTMLCanvasElement = realCreateElement.call(document, element, options);

            let [nextCanvas] = mockCtx.canvasStack.splice(0, 1);
            if (!nextCanvas) {
                nextCanvas = createCanvas(width, height);
            }
            mockCtx.canvases.push(nextCanvas);

            mockedElement.getContext = (p) => {
                const context2d = nextCanvas.getContext(p, { alpha: true });
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
    document.createElement = mockContext.realCreateElement;
    if (mockContext.ctx) {
        mockContext.ctx.nodeCanvas = undefined;
    }
    mockContext.canvasStack = [];
    mockContext.canvases = [];
}
