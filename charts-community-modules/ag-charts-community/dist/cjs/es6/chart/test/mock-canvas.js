"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardown = exports.setup = exports.MockContext = void 0;
const canvas_1 = require("canvas");
class MockContext {
    constructor(width = 1, height = 1, realCreateElement = document.createElement) {
        const nodeCanvas = canvas_1.createCanvas(width, height);
        this.realCreateElement = realCreateElement;
        this.ctx = { nodeCanvas };
        this.canvasStack = [nodeCanvas];
        this.canvases = [nodeCanvas];
    }
    destroy() {
        this.ctx.nodeCanvas = undefined;
        this.realCreateElement = undefined;
        this.canvasStack = [];
        this.canvases = [];
    }
}
exports.MockContext = MockContext;
function setup({ width = 800, height = 600, mockCtx = new MockContext() } = {}) {
    const nodeCanvas = canvas_1.createCanvas(width, height);
    mockCtx.ctx.nodeCanvas = nodeCanvas;
    mockCtx.canvasStack = [nodeCanvas];
    if (typeof window !== 'undefined') {
        window['agChartsSceneRenderModel'] = 'composite';
    }
    else {
        global['agChartsSceneRenderModel'] = 'composite';
    }
    const realCreateElement = document.createElement;
    mockCtx.realCreateElement = realCreateElement;
    document.createElement = (element, options) => {
        if (element === 'canvas') {
            const mockedElement = realCreateElement.call(document, element, options);
            let [nextCanvas] = mockCtx.canvasStack.splice(0, 1);
            if (!nextCanvas) {
                nextCanvas = canvas_1.createCanvas(width, height);
            }
            mockCtx.canvases.push(nextCanvas);
            mockedElement.getContext = (type) => {
                const context2d = nextCanvas.getContext(type, { alpha: true });
                context2d.patternQuality = 'good';
                context2d.quality = 'good';
                context2d.textDrawingMode = 'path';
                context2d.antialias = 'subpixel';
                return context2d;
            };
            return mockedElement;
        }
        else if (element === 'img') {
            return new canvas_1.Image();
        }
        return realCreateElement.call(document, element, options);
    };
    return mockCtx;
}
exports.setup = setup;
function teardown(mockContext) {
    document.createElement = mockContext.realCreateElement;
    mockContext.destroy();
}
exports.teardown = teardown;
