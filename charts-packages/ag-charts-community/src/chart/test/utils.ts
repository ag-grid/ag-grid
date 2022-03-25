import { expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Canvas, createCanvas, PngConfig } from 'canvas';
import * as pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';

import { Chart } from "../chart";
import { CartesianChart } from '../cartesianChart';
import { PolarChart } from '../polarChart';
import { HierarchyChart } from '../hierarchyChart';

export const IMAGE_SNAPSHOT_DEFAULTS = { failureThreshold: 0.5, failureThresholdType: "percent" };
export const CANVAS_TO_BUFFER_DEFAULTS: PngConfig = { compressionLevel: 0, filters: (Canvas as any).PNG_NO_FILTERS };

// process.env.FC_DEBUG = String(0xffff);
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = __dirname;
process.env.FONTCONFIG_NAME = `${__dirname}/fonts.conf`;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function repeat<T>(value: T, count: number): T[] {
    const result = new Array(count);
    for (let idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}

export async function waitForChartStability(chart: Chart, timeoutMs = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        let retryMs = 10;
        let startMs = Date.now();
        const cb = () => {
            if (!chart.layoutPending && !chart.dataPending && !chart.scene.dirty) {
                resolve();
            }

            const timeMs = Date.now() - startMs;
            if (timeMs >= timeoutMs) {
                reject('timeout reached');
            }

            retryMs *= 2;
            setTimeout(cb, retryMs);
        };

        cb();
    });
}

export function mouseMoveEvent({ offsetX, offsetY }: { offsetX: number, offsetY: number}): MouseEvent {
    const event = new MouseEvent('mousemove');
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}

export function cartesianChartAssertions(params?: { type?: string; axisTypes?: string[]; seriesTypes?: string[] }) {
    const { axisTypes = ['category', 'number'], seriesTypes = ['bar'] } = params || {};

    return async (chart: Chart) => {
        expect(chart).toBeInstanceOf(CartesianChart);
        expect(chart.axes).toHaveLength(axisTypes.length);
        expect(chart.axes.map((a) => a.type)).toEqual(axisTypes);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    };
}

export function polarChartAssertions(params?: { seriesTypes?: string[] }) {
    const { seriesTypes = ['pie'] } = params || {};

    return async (chart: Chart) => {
        expect(chart).toBeInstanceOf(PolarChart);
        expect(chart.axes).toHaveLength(0);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    };
}

export function hierarchyChartAssertions(params?: { seriesTypes?: string[] }) {
    const { seriesTypes = ['treemap'] } = params || {};

    return async (chart: Chart) => {
        expect(chart).toBeInstanceOf(HierarchyChart);
        expect(chart.axes).toHaveLength(0);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    };
}

export function hoverAction(x: number, y: number): (chart: Chart) => Promise<void> {
    return async (chart) => {
        // Reveal tooltip.
        chart.scene.canvas.element.dispatchEvent(mouseMoveEvent({ offsetX: x - 1, offsetY: y - 1 }));
        chart.scene.canvas.element.dispatchEvent(mouseMoveEvent({ offsetX: x, offsetY: y }));

        return new Promise((resolve) => { setTimeout(resolve, 50) });
    };
}

export function combineAssertions(...assertions: ((chart: Chart) => void)[]) {
    return async (chart: Chart) => {
        for (const assertion of assertions) {
            await assertion(chart);
        }
    }
}

export function setupMockCanvas(): { nodeCanvas?: Canvas } {
    let realCreateElement: typeof document.createElement;
    let ctx: { nodeCanvas?: Canvas } = {};

    beforeEach(() => {
        ctx.nodeCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        realCreateElement = document.createElement;
        document.createElement = jest.fn(
            (element, options) => {
                if (element === 'canvas') {
                    const mockedElement = realCreateElement.call(document, element, options);
                    mockedElement.getContext = (p) => { 
                        const context2d = ctx.nodeCanvas.getContext(p, { alpha: false });
                        context2d.patternQuality = 'good';
                        context2d.quality = 'good';
                        context2d.textDrawingMode = 'path';
                        context2d.antialias = 'subpixel';
                
                        return context2d as any;
                    };

                    return mockedElement;
                }

                return realCreateElement.call(document, element, options);
            },
        );
    });

    afterEach(() => {
        document.createElement = realCreateElement;
        ctx.nodeCanvas = null;
    });

    return ctx;
}

export function toMatchImage(actual, expected) {
    const {
        testPath, currentTestName, isNot, snapshotState,
    } = this;

    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    const diff = new PNG({width, height});
    const result = pixelmatch(
        actual,
        expected,
        diff.data,
        width,
        height,
        { threshold: 0.01 },
    );

    const diffOutputFilename = `${testPath.substring(0, testPath.lastIndexOf('/'))}/__image_snapshots__/${currentTestName}-diff.png`;
    const diffPercentage = (result * 100) / (width * height);
    const pass = diffPercentage <= 0.05;

    if (!pass) {
        fs.writeFileSync(diffOutputFilename, (PNG as any).sync.write(diff));
    } else if (fs.existsSync(diffOutputFilename)) {
        fs.unlinkSync(diffOutputFilename);
    }

    return { message: () => `Images were ${result} (${diffPercentage.toFixed(2)}%) pixels different`, pass };
}