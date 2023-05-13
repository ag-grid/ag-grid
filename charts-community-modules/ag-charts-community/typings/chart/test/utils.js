"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMatchImage = exports.setupMockCanvas = exports.extractImageData = exports.combineAssertions = exports.scrollAction = exports.doubleClickAction = exports.clickAction = exports.hoverAction = exports.hierarchyChartAssertions = exports.polarChartAssertions = exports.cartesianChartAssertions = exports.wheelEvent = exports.doubleClickEvent = exports.clickEvent = exports.mouseMoveEvent = exports.waitForChartStability = exports.dateRange = exports.range = exports.repeat = exports.deproxy = exports.prepareTestOptions = exports.CANVAS_TO_BUFFER_DEFAULTS = exports.IMAGE_SNAPSHOT_DEFAULTS = void 0;
var globals_1 = require("@jest/globals");
var canvas_1 = require("canvas");
var pixelmatch = require("pixelmatch");
var pngjs_1 = require("pngjs");
var fs = require("fs");
var chart_1 = require("../chart");
var cartesianChart_1 = require("../cartesianChart");
var polarChart_1 = require("../polarChart");
var hierarchyChart_1 = require("../hierarchyChart");
var id_1 = require("../../util/id");
var mockCanvas = require("./mock-canvas");
var FAILURE_THRESHOLD = Number((_a = process.env.SNAPSHOT_FAILURE_THRESHOLD) !== null && _a !== void 0 ? _a : 0.05);
exports.IMAGE_SNAPSHOT_DEFAULTS = { failureThreshold: FAILURE_THRESHOLD, failureThresholdType: 'percent' };
exports.CANVAS_TO_BUFFER_DEFAULTS = { compressionLevel: 6, filters: canvas_1.Canvas.PNG_NO_FILTERS };
// process.env.FC_DEBUG = String(0xffff);
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = __dirname;
process.env.FONTCONFIG_NAME = __dirname + "/fonts.conf";
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
function prepareTestOptions(options, container) {
    if (container === void 0) { container = document.body; }
    options.autoSize = false;
    options.width = CANVAS_WIDTH;
    options.height = CANVAS_HEIGHT;
    options.container = container;
}
exports.prepareTestOptions = prepareTestOptions;
function deproxy(chartOrProxy) {
    return chartOrProxy instanceof chart_1.Chart ? chartOrProxy : chartOrProxy.chart;
}
exports.deproxy = deproxy;
function repeat(value, count) {
    var result = new Array(count);
    for (var idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}
exports.repeat = repeat;
function range(start, end, step) {
    if (step === void 0) { step = 1; }
    var result = new Array(Math.floor((end - start) / step));
    var resultIndex = 0;
    for (var index = start; index <= end; index += step) {
        result[resultIndex++] = index;
    }
    return result;
}
exports.range = range;
function dateRange(start, end, step) {
    if (step === void 0) { step = 24 * 60 * 60 * 1000; }
    var result = [];
    var next = start.getTime();
    var endTime = end.getTime();
    while (next <= endTime) {
        result.push(new Date(next));
        next += step;
    }
    return result;
}
exports.dateRange = dateRange;
function waitForChartStability(chartOrProxy, timeoutMs) {
    var _a, _b;
    if (timeoutMs === void 0) { timeoutMs = 5000; }
    return __awaiter(this, void 0, void 0, function () {
        var chart, chartAny, width, height;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    chart = deproxy(chartOrProxy);
                    chartAny = chart;
                    return [4 /*yield*/, chart.waitForUpdate(timeoutMs)];
                case 1:
                    _c.sent();
                    if (!(chart.autoSize === true && !chartAny._lastAutoSize)) return [3 /*break*/, 3];
                    width = (_a = chart.width) !== null && _a !== void 0 ? _a : chart.scene.canvas.width;
                    height = (_b = chart.height) !== null && _b !== void 0 ? _b : chart.scene.canvas.height;
                    chartAny._lastAutoSize = [width, height];
                    chartAny.resize(width, height);
                    return [4 /*yield*/, chart.waitForUpdate(timeoutMs)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.waitForChartStability = waitForChartStability;
function mouseMoveEvent(_a) {
    var offsetX = _a.offsetX, offsetY = _a.offsetY;
    var event = new MouseEvent('mousemove', { bubbles: true });
    Object.assign(event, { offsetX: offsetX, offsetY: offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
exports.mouseMoveEvent = mouseMoveEvent;
function clickEvent(_a) {
    var offsetX = _a.offsetX, offsetY = _a.offsetY;
    var event = new MouseEvent('click', { bubbles: true });
    Object.assign(event, { offsetX: offsetX, offsetY: offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
exports.clickEvent = clickEvent;
function doubleClickEvent(_a) {
    var offsetX = _a.offsetX, offsetY = _a.offsetY;
    var event = new MouseEvent('dblclick', { bubbles: true });
    Object.assign(event, { offsetX: offsetX, offsetY: offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
exports.doubleClickEvent = doubleClickEvent;
function wheelEvent(_a) {
    var clientX = _a.clientX, clientY = _a.clientY, deltaY = _a.deltaY;
    return new WheelEvent('wheel', { bubbles: true, clientX: clientX, clientY: clientY, deltaY: deltaY });
}
exports.wheelEvent = wheelEvent;
function cartesianChartAssertions(params) {
    var _this = this;
    var _a = params || {}, _b = _a.axisTypes, axisTypes = _b === void 0 ? ['category', 'number'] : _b, _c = _a.seriesTypes, seriesTypes = _c === void 0 ? ['bar'] : _c;
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var chart;
        return __generator(this, function (_a) {
            chart = deproxy(chartOrProxy);
            globals_1.expect(chart).toBeInstanceOf(cartesianChart_1.CartesianChart);
            globals_1.expect(chart.axes).toHaveLength(axisTypes.length);
            globals_1.expect(chart.axes.map(function (a) { return a.type; })).toEqual(axisTypes);
            globals_1.expect(chart.series.map(function (s) { return s.type; })).toEqual(seriesTypes);
            return [2 /*return*/];
        });
    }); };
}
exports.cartesianChartAssertions = cartesianChartAssertions;
function polarChartAssertions(params) {
    var _this = this;
    var _a = (params || {}).seriesTypes, seriesTypes = _a === void 0 ? ['pie'] : _a;
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var chart;
        return __generator(this, function (_a) {
            chart = deproxy(chartOrProxy);
            globals_1.expect(chart).toBeInstanceOf(polarChart_1.PolarChart);
            globals_1.expect(chart.axes).toHaveLength(0);
            globals_1.expect(chart.series.map(function (s) { return s.type; })).toEqual(seriesTypes);
            return [2 /*return*/];
        });
    }); };
}
exports.polarChartAssertions = polarChartAssertions;
function hierarchyChartAssertions(params) {
    var _this = this;
    var _a = (params || {}).seriesTypes, seriesTypes = _a === void 0 ? ['treemap'] : _a;
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var chart;
        return __generator(this, function (_a) {
            chart = deproxy(chartOrProxy);
            globals_1.expect(chart).toBeInstanceOf(hierarchyChart_1.HierarchyChart);
            globals_1.expect(chart.axes).toHaveLength(0);
            globals_1.expect(chart.series.map(function (s) { return s.type; })).toEqual(seriesTypes);
            return [2 /*return*/];
        });
    }); };
}
exports.hierarchyChartAssertions = hierarchyChartAssertions;
var checkTargetValid = function (target) {
    if (!target.isConnected)
        throw new Error('Chart must be configured with a container for event testing to work');
};
function hoverAction(x, y) {
    var _this = this;
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var chart, target;
        return __generator(this, function (_a) {
            chart = deproxy(chartOrProxy);
            target = chart.scene.canvas.element;
            checkTargetValid(target);
            // Reveal tooltip.
            target === null || target === void 0 ? void 0 : target.dispatchEvent(mouseMoveEvent({ offsetX: x - 1, offsetY: y - 1 }));
            target === null || target === void 0 ? void 0 : target.dispatchEvent(mouseMoveEvent({ offsetX: x, offsetY: y }));
            return [2 /*return*/, new Promise(function (resolve) {
                    setTimeout(resolve, 50);
                })];
        });
    }); };
}
exports.hoverAction = hoverAction;
function clickAction(x, y) {
    var _this = this;
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var chart, target;
        return __generator(this, function (_a) {
            chart = deproxy(chartOrProxy);
            target = chart.scene.canvas.element;
            checkTargetValid(target);
            target === null || target === void 0 ? void 0 : target.dispatchEvent(clickEvent({ offsetX: x, offsetY: y }));
            return [2 /*return*/, new Promise(function (resolve) {
                    setTimeout(resolve, 50);
                })];
        });
    }); };
}
exports.clickAction = clickAction;
function doubleClickAction(x, y) {
    var _this = this;
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var chart, target;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chart = deproxy(chartOrProxy);
                    target = chart.scene.canvas.element;
                    // A double click is always preceeded by two single clicks, simulate here to ensure correct handling
                    target === null || target === void 0 ? void 0 : target.dispatchEvent(clickEvent({ offsetX: x, offsetY: y }));
                    target === null || target === void 0 ? void 0 : target.dispatchEvent(clickEvent({ offsetX: x, offsetY: y }));
                    return [4 /*yield*/, new Promise(function (resolve) {
                            setTimeout(resolve, 50);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, waitForChartStability(chart)];
                case 2:
                    _a.sent();
                    target === null || target === void 0 ? void 0 : target.dispatchEvent(doubleClickEvent({ offsetX: x, offsetY: y }));
                    return [2 /*return*/, new Promise(function (resolve) {
                            setTimeout(resolve, 50);
                        })];
            }
        });
    }); };
}
exports.doubleClickAction = doubleClickAction;
function scrollAction(x, y, delta) {
    window.dispatchEvent(wheelEvent({ clientX: x, clientY: y, deltaY: delta }));
    return new Promise(function (resolve) {
        setTimeout(resolve, 50);
    });
}
exports.scrollAction = scrollAction;
function combineAssertions() {
    var _this = this;
    var assertions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        assertions[_i] = arguments[_i];
    }
    return function (chartOrProxy) { return __awaiter(_this, void 0, void 0, function () {
        var assertions_1, assertions_1_1, assertion, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    assertions_1 = __values(assertions), assertions_1_1 = assertions_1.next();
                    _b.label = 1;
                case 1:
                    if (!!assertions_1_1.done) return [3 /*break*/, 4];
                    assertion = assertions_1_1.value;
                    return [4 /*yield*/, assertion(chartOrProxy)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    assertions_1_1 = assertions_1.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (assertions_1_1 && !assertions_1_1.done && (_a = assertions_1.return)) _a.call(assertions_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
}
exports.combineAssertions = combineAssertions;
function extractImageData(_a) {
    var nodeCanvas = _a.nodeCanvas, bbox = _a.bbox;
    var sourceCanvas = nodeCanvas;
    if (bbox && nodeCanvas) {
        var x = bbox.x, y = bbox.y, width = bbox.width, height = bbox.height;
        sourceCanvas = canvas_1.createCanvas(width, height);
        sourceCanvas === null || sourceCanvas === void 0 ? void 0 : sourceCanvas.getContext('2d').drawImage(nodeCanvas, Math.round(x), Math.round(y), Math.round(width), Math.round(height), 0, 0, Math.round(width), Math.round(height));
    }
    return sourceCanvas === null || sourceCanvas === void 0 ? void 0 : sourceCanvas.toBuffer('image/png', exports.CANVAS_TO_BUFFER_DEFAULTS);
}
exports.extractImageData = extractImageData;
function setupMockCanvas() {
    var mockCtx = new mockCanvas.MockContext();
    globals_1.beforeEach(function () {
        id_1.resetIds();
        mockCanvas.setup({ mockCtx: mockCtx, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    });
    globals_1.afterEach(function () {
        mockCanvas.teardown(mockCtx);
    });
    return mockCtx === null || mockCtx === void 0 ? void 0 : mockCtx.ctx;
}
exports.setupMockCanvas = setupMockCanvas;
function toMatchImage(actual, expected, _a) {
    var _b = (_a === void 0 ? {} : _a).writeDiff, writeDiff = _b === void 0 ? true : _b;
    // Grab values from enclosing Jest scope.
    var _c = this, testPath = _c.testPath, currentTestName = _c.currentTestName;
    var width = CANVAS_WIDTH;
    var height = CANVAS_HEIGHT;
    var diff = new pngjs_1.PNG({ width: width, height: height });
    var result = pixelmatch(actual, expected, diff.data, width, height, { threshold: 0.01 });
    var diffOutputFilename = testPath.substring(0, testPath.lastIndexOf('/')) + "/__image_snapshots__/" + currentTestName + "-diff.png";
    var diffPercentage = (result * 100) / (width * height);
    var pass = diffPercentage <= 0.05;
    if (!pass && writeDiff) {
        fs.writeFileSync(diffOutputFilename, pngjs_1.PNG.sync.write(diff));
    }
    else if (fs.existsSync(diffOutputFilename)) {
        fs.unlinkSync(diffOutputFilename);
    }
    return { message: function () { return "Images were " + result + " (" + diffPercentage.toFixed(2) + "%) pixels different"; }, pass: pass };
}
exports.toMatchImage = toMatchImage;
//# sourceMappingURL=utils.js.map