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
import { expect, beforeEach, afterEach } from '@jest/globals';
import { Canvas, createCanvas } from 'canvas';
import * as pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import { Chart } from '../chart';
import { CartesianChart } from '../cartesianChart';
import { PolarChart } from '../polarChart';
import { HierarchyChart } from '../hierarchyChart';
import { resetIds } from '../../util/id';
import * as mockCanvas from './mock-canvas';
const FAILURE_THRESHOLD = Number((_a = process.env.SNAPSHOT_FAILURE_THRESHOLD) !== null && _a !== void 0 ? _a : 0.05);
export const IMAGE_SNAPSHOT_DEFAULTS = { failureThreshold: FAILURE_THRESHOLD, failureThresholdType: 'percent' };
export const CANVAS_TO_BUFFER_DEFAULTS = { compressionLevel: 6, filters: Canvas.PNG_NO_FILTERS };
// process.env.FC_DEBUG = String(0xffff);
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = __dirname;
process.env.FONTCONFIG_NAME = `${__dirname}/fonts.conf`;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
export function prepareTestOptions(options, container = document.body) {
    options.autoSize = false;
    options.width = CANVAS_WIDTH;
    options.height = CANVAS_HEIGHT;
    options.container = container;
}
export function deproxy(chartOrProxy) {
    return chartOrProxy instanceof Chart ? chartOrProxy : chartOrProxy.chart;
}
export function repeat(value, count) {
    const result = new Array(count);
    for (let idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}
export function range(start, end, step = 1) {
    const result = new Array(Math.floor((end - start) / step));
    let resultIndex = 0;
    for (let index = start; index <= end; index += step) {
        result[resultIndex++] = index;
    }
    return result;
}
export function dateRange(start, end, step = 24 * 60 * 60 * 1000) {
    const result = [];
    let next = start.getTime();
    const endTime = end.getTime();
    while (next <= endTime) {
        result.push(new Date(next));
        next += step;
    }
    return result;
}
export function waitForChartStability(chartOrProxy, timeoutMs = 5000) {
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
export function mouseMoveEvent({ offsetX, offsetY }) {
    const event = new MouseEvent('mousemove', { bubbles: true });
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
export function clickEvent({ offsetX, offsetY }) {
    const event = new MouseEvent('click', { bubbles: true });
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
export function doubleClickEvent({ offsetX, offsetY }) {
    const event = new MouseEvent('dblclick', { bubbles: true });
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
export function wheelEvent({ clientX, clientY, deltaY, }) {
    return new WheelEvent('wheel', { bubbles: true, clientX, clientY, deltaY });
}
export function cartesianChartAssertions(params) {
    const { axisTypes = ['category', 'number'], seriesTypes = ['bar'] } = params || {};
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        expect(chart).toBeInstanceOf(CartesianChart);
        expect(chart.axes).toHaveLength(axisTypes.length);
        expect(chart.axes.map((a) => a.type)).toEqual(axisTypes);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    });
}
export function polarChartAssertions(params) {
    const { seriesTypes = ['pie'] } = params || {};
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        expect(chart).toBeInstanceOf(PolarChart);
        expect(chart.axes).toHaveLength(0);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    });
}
export function hierarchyChartAssertions(params) {
    const { seriesTypes = ['treemap'] } = params || {};
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        const chart = deproxy(chartOrProxy);
        expect(chart).toBeInstanceOf(HierarchyChart);
        expect(chart.axes).toHaveLength(0);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    });
}
const checkTargetValid = (target) => {
    if (!target.isConnected)
        throw new Error('Chart must be configured with a container for event testing to work');
};
export function hoverAction(x, y) {
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
export function clickAction(x, y) {
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
export function doubleClickAction(x, y) {
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
export function scrollAction(x, y, delta) {
    window.dispatchEvent(wheelEvent({ clientX: x, clientY: y, deltaY: delta }));
    return new Promise((resolve) => {
        setTimeout(resolve, 50);
    });
}
export function combineAssertions(...assertions) {
    return (chartOrProxy) => __awaiter(this, void 0, void 0, function* () {
        for (const assertion of assertions) {
            yield assertion(chartOrProxy);
        }
    });
}
export function extractImageData({ nodeCanvas, bbox, }) {
    let sourceCanvas = nodeCanvas;
    if (bbox && nodeCanvas) {
        const { x, y, width, height } = bbox;
        sourceCanvas = createCanvas(width, height);
        sourceCanvas === null || sourceCanvas === void 0 ? void 0 : sourceCanvas.getContext('2d').drawImage(nodeCanvas, Math.round(x), Math.round(y), Math.round(width), Math.round(height), 0, 0, Math.round(width), Math.round(height));
    }
    return sourceCanvas === null || sourceCanvas === void 0 ? void 0 : sourceCanvas.toBuffer('image/png', CANVAS_TO_BUFFER_DEFAULTS);
}
export function setupMockCanvas() {
    const mockCtx = new mockCanvas.MockContext();
    beforeEach(() => {
        resetIds();
        mockCanvas.setup({ mockCtx, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    });
    afterEach(() => {
        mockCanvas.teardown(mockCtx);
    });
    return mockCtx === null || mockCtx === void 0 ? void 0 : mockCtx.ctx;
}
export function toMatchImage(actual, expected, { writeDiff = true } = {}) {
    // Grab values from enclosing Jest scope.
    const { testPath, currentTestName } = this;
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    const diff = new PNG({ width, height });
    const result = pixelmatch(actual, expected, diff.data, width, height, { threshold: 0.01 });
    const diffOutputFilename = `${testPath.substring(0, testPath.lastIndexOf('/'))}/__image_snapshots__/${currentTestName}-diff.png`;
    const diffPercentage = (result * 100) / (width * height);
    const pass = diffPercentage <= 0.05;
    if (!pass && writeDiff) {
        fs.writeFileSync(diffOutputFilename, PNG.sync.write(diff));
    }
    else if (fs.existsSync(diffOutputFilename)) {
        fs.unlinkSync(diffOutputFilename);
    }
    return { message: () => `Images were ${result} (${diffPercentage.toFixed(2)}%) pixels different`, pass };
}
