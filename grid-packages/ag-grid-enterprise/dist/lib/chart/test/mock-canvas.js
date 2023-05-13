"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardown = exports.setup = exports.MockContext = void 0;
var canvas_1 = require("canvas");
var MockContext = /** @class */ (function () {
    function MockContext(width, height, realCreateElement) {
        if (width === void 0) { width = 1; }
        if (height === void 0) { height = 1; }
        if (realCreateElement === void 0) { realCreateElement = document.createElement; }
        var nodeCanvas = canvas_1.createCanvas(width, height);
        this.realCreateElement = realCreateElement;
        this.ctx = { nodeCanvas: nodeCanvas };
        this.canvasStack = [nodeCanvas];
        this.canvases = [nodeCanvas];
    }
    MockContext.prototype.destroy = function () {
        this.ctx.nodeCanvas = undefined;
        this.realCreateElement = undefined;
        this.canvasStack = [];
        this.canvases = [];
    };
    return MockContext;
}());
exports.MockContext = MockContext;
function setup(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.width, width = _c === void 0 ? 800 : _c, _d = _b.height, height = _d === void 0 ? 600 : _d, _e = _b.mockCtx, mockCtx = _e === void 0 ? new MockContext() : _e;
    var nodeCanvas = canvas_1.createCanvas(width, height);
    mockCtx.ctx.nodeCanvas = nodeCanvas;
    mockCtx.canvasStack = [nodeCanvas];
    if (typeof window !== 'undefined') {
        window['agChartsSceneRenderModel'] = 'composite';
    }
    else {
        global['agChartsSceneRenderModel'] = 'composite';
    }
    var realCreateElement = document.createElement;
    mockCtx.realCreateElement = realCreateElement;
    document.createElement = function (element, options) {
        if (element === 'canvas') {
            var mockedElement = realCreateElement.call(document, element, options);
            var _a = __read(mockCtx.canvasStack.splice(0, 1), 1), nextCanvas_1 = _a[0];
            if (!nextCanvas_1) {
                nextCanvas_1 = canvas_1.createCanvas(width, height);
            }
            mockCtx.canvases.push(nextCanvas_1);
            mockedElement.getContext = function (type) {
                var context2d = nextCanvas_1.getContext(type, { alpha: true });
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
//# sourceMappingURL=mock-canvas.js.map