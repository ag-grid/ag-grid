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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMatchImage = exports.setupMockCanvas = exports.extractImageData = exports.combineAssertions = exports.scrollAction = exports.doubleClickAction = exports.clickAction = exports.hoverAction = exports.hierarchyChartAssertions = exports.polarChartAssertions = exports.cartesianChartAssertions = exports.wheelEvent = exports.doubleClickEvent = exports.clickEvent = exports.mouseMoveEvent = exports.waitForChartStability = exports.dateRange = exports.range = exports.repeat = exports.deproxy = exports.prepareTestOptions = exports.CANVAS_TO_BUFFER_DEFAULTS = exports.IMAGE_SNAPSHOT_DEFAULTS = void 0;
const globals_1 = require("@jest/globals");
const canvas_1 = require("canvas");
const pixelmatch = require("pixelmatch");
const pngjs_1 = require("pngjs");
const fs = require("fs");
const chart_1 = require("../chart");
const cartesianChart_1 = require("../cartesianChart");
const polarChart_1 = require("../polarChart");
const hierarchyChart_1 = require("../hierarchyChart");
const id_1 = require("../../util/id");
const mockCanvas = require("./mock-canvas");
const FAILURE_THRESHOLD = Number((_a = process.env.SNAPSHOT_FAILURE_THRESHOLD) !== null && _a !== void 0 ? _a : 0.05);
exports.IMAGE_SNAPSHOT_DEFAULTS = { failureThreshold: FAILURE_THRESHOLD, failureThresholdType: 'percent' };
exports.CANVAS_TO_BUFFER_DEFAULTS = { compressionLevel: 6, filters: canvas_1.Canvas.PNG_NO_FILTERS };
// process.env.FC_DEBUG = String(0xffff);
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = __dirname;
process.env.FONTCONFIG_NAME = `${__dirname}/fonts.conf`;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
function prepareTestOptions(options, container = document.body) {
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
    const result = new Array(count);
    for (let idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}
exports.repeat = repeat;
function range(start, end, step = 1) {
    const result = new Array(Math.floor((end - start) / step));
    let resultIndex = 0;
    for (let index = start; index <= end; index += step) {
        result[resultIndex++] = index;
    }
    return result;
}
exports.range = range;
function dateRange(start, end, step = 24 * 60 * 60 * 1000) {
    const result = [];
    let next = start.getTime();
    const endTime = end.getTime();
    while (next <= endTime) {
        result.push(new Date(next));
        next += step;
    }
    return result;
}
exports.dateRange = dateRange;
function waitForChartStability(chartOrProxy, timeoutMs = 5000) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        const chartAny = chart;
        yield chart.waitForUpdate(timeoutMs);
        if (chart.autoSize === true && !chartAny._lastAutoSize) {
            // Bypass wait for SizeObservable callback - it's never going to be invoked.
            const width = (_a = chart.width) !== null && _a !== void 0 ? _a : chart.scene.canvas.width;
            const height = (_b = chart.height) !== null && _b !== void 0 ? _b : chart.scene.canvas.height;
            chartAny._lastAutoSize = [width, height];
            chartAny.resize(width, height);
            yield chart.waitForUpdate(timeoutMs);
        }
    });
}
exports.waitForChartStability = waitForChartStability;
function mouseMoveEvent({ offsetX, offsetY }) {
    const event = new MouseEvent('mousemove', { bubbles: true });
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
exports.mouseMoveEvent = mouseMoveEvent;
function clickEvent({ offsetX, offsetY }) {
    const event = new MouseEvent('click', { bubbles: true });
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
exports.clickEvent = clickEvent;
function doubleClickEvent({ offsetX, offsetY }) {
    const event = new MouseEvent('dblclick', { bubbles: true });
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
exports.doubleClickEvent = doubleClickEvent;
function wheelEvent({ clientX, clientY, deltaY, }) {
    return new WheelEvent('wheel', { bubbles: true, clientX, clientY, deltaY });
}
exports.wheelEvent = wheelEvent;
function cartesianChartAssertions(params) {
    const { axisTypes = ['category', 'number'], seriesTypes = ['bar'] } = params || {};
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        globals_1.expect(chart).toBeInstanceOf(cartesianChart_1.CartesianChart);
        globals_1.expect(chart.axes).toHaveLength(axisTypes.length);
        globals_1.expect(chart.axes.map((a) => a.type)).toEqual(axisTypes);
        globals_1.expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    });
}
exports.cartesianChartAssertions = cartesianChartAssertions;
function polarChartAssertions(params) {
    const { seriesTypes = ['pie'] } = params || {};
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        globals_1.expect(chart).toBeInstanceOf(polarChart_1.PolarChart);
        globals_1.expect(chart.axes).toHaveLength(0);
        globals_1.expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    });
}
exports.polarChartAssertions = polarChartAssertions;
function hierarchyChartAssertions(params) {
    const { seriesTypes = ['treemap'] } = params || {};
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        globals_1.expect(chart).toBeInstanceOf(hierarchyChart_1.HierarchyChart);
        globals_1.expect(chart.axes).toHaveLength(0);
        globals_1.expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    });
}
exports.hierarchyChartAssertions = hierarchyChartAssertions;
const checkTargetValid = (target) => {
    if (!target.isConnected)
        throw new Error('Chart must be configured with a container for event testing to work');
};
function hoverAction(x, y) {
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        const target = chart.scene.canvas.element;
        checkTargetValid(target);
        // Reveal tooltip.
        target === null || target === void 0 ? void 0 : target.dispatchEvent(mouseMoveEvent({ offsetX: x - 1, offsetY: y - 1 }));
        target === null || target === void 0 ? void 0 : target.dispatchEvent(mouseMoveEvent({ offsetX: x, offsetY: y }));
        return new Promise((resolve) => {
            setTimeout(resolve, 50);
        });
    });
}
exports.hoverAction = hoverAction;
function clickAction(x, y) {
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        const target = chart.scene.canvas.element;
        checkTargetValid(target);
        target === null || target === void 0 ? void 0 : target.dispatchEvent(clickEvent({ offsetX: x, offsetY: y }));
        return new Promise((resolve) => {
            setTimeout(resolve, 50);
        });
    });
}
exports.clickAction = clickAction;
function doubleClickAction(x, y) {
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        const target = chart.scene.canvas.element;
        // A double click is always preceeded by two single clicks, simulate here to ensure correct handling
        target === null || target === void 0 ? void 0 : target.dispatchEvent(clickEvent({ offsetX: x, offsetY: y }));
        target === null || target === void 0 ? void 0 : target.dispatchEvent(clickEvent({ offsetX: x, offsetY: y }));
        yield new Promise((resolve) => {
            setTimeout(resolve, 50);
        });
        yield waitForChartStability(chart);
        target === null || target === void 0 ? void 0 : target.dispatchEvent(doubleClickEvent({ offsetX: x, offsetY: y }));
        return new Promise((resolve) => {
            setTimeout(resolve, 50);
        });
    });
}
exports.doubleClickAction = doubleClickAction;
function scrollAction(x, y, delta) {
    window.dispatchEvent(wheelEvent({ clientX: x, clientY: y, deltaY: delta }));
    return new Promise((resolve) => {
        setTimeout(resolve, 50);
    });
}
exports.scrollAction = scrollAction;
function combineAssertions(...assertions) {
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        for (const assertion of assertions) {
            yield assertion(chartOrProxy);
        }
    });
}
exports.combineAssertions = combineAssertions;
function extractImageData({ nodeCanvas, bbox, }) {
    let sourceCanvas = nodeCanvas;
    if (bbox && nodeCanvas) {
        const { x, y, width, height } = bbox;
        sourceCanvas = canvas_1.createCanvas(width, height);
        sourceCanvas === null || sourceCanvas === void 0 ? void 0 : sourceCanvas.getContext('2d').drawImage(nodeCanvas, Math.round(x), Math.round(y), Math.round(width), Math.round(height), 0, 0, Math.round(width), Math.round(height));
    }
    return sourceCanvas === null || sourceCanvas === void 0 ? void 0 : sourceCanvas.toBuffer('image/png', exports.CANVAS_TO_BUFFER_DEFAULTS);
}
exports.extractImageData = extractImageData;
function setupMockCanvas() {
    const mockCtx = new mockCanvas.MockContext();
    globals_1.beforeEach(() => {
        id_1.resetIds();
        mockCanvas.setup({ mockCtx, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    });
    globals_1.afterEach(() => {
        mockCanvas.teardown(mockCtx);
    });
    return mockCtx === null || mockCtx === void 0 ? void 0 : mockCtx.ctx;
}
exports.setupMockCanvas = setupMockCanvas;
function toMatchImage(actual, expected, { writeDiff = true } = {}) {
    // Grab values from enclosing Jest scope.
    const { testPath, currentTestName } = this;
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    const diff = new pngjs_1.PNG({ width, height });
    const result = pixelmatch(actual, expected, diff.data, width, height, { threshold: 0.01 });
    const diffOutputFilename = `${testPath.substring(0, testPath.lastIndexOf('/'))}/__image_snapshots__/${currentTestName}-diff.png`;
    const diffPercentage = (result * 100) / (width * height);
    const pass = diffPercentage <= 0.05;
    if (!pass && writeDiff) {
        fs.writeFileSync(diffOutputFilename, pngjs_1.PNG.sync.write(diff));
    }
    else if (fs.existsSync(diffOutputFilename)) {
        fs.unlinkSync(diffOutputFilename);
    }
    return { message: () => `Images were ${result} (${diffPercentage.toFixed(2)}%) pixels different`, pass };
}
exports.toMatchImage = toMatchImage;
