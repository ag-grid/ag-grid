import { expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Canvas, createCanvas, PngConfig } from 'canvas';
import * as pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';

import { Chart } from '../chart';
import { CartesianChart } from '../cartesianChart';
import { PolarChart } from '../polarChart';
import { HierarchyChart } from '../hierarchyChart';
import { AgCartesianChartOptions, AgChartOptions, AgPolarChartOptions } from '../agChartOptions';
import { resetIds } from '../../util/id';

export interface TestCase {
    options: AgChartOptions;
    assertions: (chart: Chart) => Promise<void>;
    extraScreenshotActions?: (chart: Chart) => Promise<void>;
}

export interface CartesianTestCase extends TestCase {
    options: AgCartesianChartOptions;
}

export interface PolarTestCase extends TestCase {
    options: AgPolarChartOptions;
}

const FAILURE_THRESHOLD = Number(process.env.SNAPSHOT_FAILURE_THRESHOLD ?? 0.05);
export const IMAGE_SNAPSHOT_DEFAULTS = { failureThreshold: FAILURE_THRESHOLD, failureThresholdType: 'percent' };
export const CANVAS_TO_BUFFER_DEFAULTS: PngConfig = { compressionLevel: 6, filters: (Canvas as any).PNG_NO_FILTERS };

// process.env.FC_DEBUG = String(0xffff);
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = __dirname;
process.env.FONTCONFIG_NAME = `${__dirname}/fonts.conf`;

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export function loadExampleOptions(name: string, evalFn = 'options'): any {
    const filters = [/^import .*/, /.*AgChart\.(update|create)/, /.* container\: .*/ /*, /.* data/*/];
    const dataFile = `../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/examples/${name}/data.ts`;
    const exampleFile = `../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/examples/${name}/main.ts`;

    const cleanTs = (content: Buffer) =>
        content
            .toString()
            .split('\n')
            // Remove grossly unsupported lines.
            .filter((line) => !filters.some((f) => f.test(line)))
            // Remove types, without matching string literals.
            .map((line) =>
                ["'", '"'].some((v) => line.indexOf(v) >= 0) ? line : line.replace(/: [A-Z][A-Za-z<, >]*/g, '')
            )
            // Remove declares.
            .map((line) => line.replace(/declare var.*;/g, ''))
            // Remove sugars.
            .map((line) => line.replace(/[a-z]!/g, ''))
            // Remove primitives + primitive arrays.
            .map((line) => line.replace(/: (number|string|any)(\[\]){0,}/g, ''))
            // Remove unsupported keywords.
            .map((line) => line.replace(/export /g, ''));

    const dataFileContent = cleanTs(fs.readFileSync(dataFile));
    const exampleFileLines = cleanTs(fs.readFileSync(exampleFile));

    let evalExpr = `${dataFileContent.join('\n')} \n ${exampleFileLines.join('\n')}; ${evalFn};`;
    try {
        // @ts-ignore - used in the eval() call.
        const agCharts = require('../../main');
        return eval(evalExpr);
    } catch (error) {
        console.error(`AG Charts - unable to read example data for [${name}]; error: ${error.message}`);
        // console.log(evalExpr);
        return [];
    }
}

export function repeat<T>(value: T, count: number): T[] {
    const result = new Array(count);
    for (let idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}

export function range(start: number, end: number, step = 1): number[] {
    const result = new Array(Math.floor((end - start) / step));

    let resultIndex = 0;
    for (let index = start; index <= end; index += step) {
        result[resultIndex++] = index;
    }

    return result;
}

export function dateRange(start: Date, end: Date, step = 24 * 60 * 60 * 1000): Date[] {
    const result = [];

    let next = start.getTime();
    const endTime = end.getTime();
    while (next <= endTime) {
        result.push(new Date(next));

        next += step;
    }

    return result;
}

export async function waitForChartStability(chart: Chart, timeoutMs = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        let retryMs = 10;
        let startMs = Date.now();
        const cb = () => {
            if (chart.lastPerformUpdateError) {
                reject(chart.lastPerformUpdateError);
                return;
            }

            if (!chart.updatePending) {
                resolve();
                return;
            }

            const timeMs = Date.now() - startMs;
            if (timeMs >= timeoutMs) {
                reject('timeout reached');
                return;
            }

            retryMs *= 2;
            setTimeout(cb, retryMs);
        };

        cb();
    });
}

export function mouseMoveEvent({ offsetX, offsetY }: { offsetX: number; offsetY: number }): MouseEvent {
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

        return new Promise((resolve) => {
            setTimeout(resolve, 50);
        });
    };
}

export function combineAssertions(...assertions: ((chart: Chart) => void)[]) {
    return async (chart: Chart) => {
        for (const assertion of assertions) {
            await assertion(chart);
        }
    };
}

export function extractImageData({
    nodeCanvas,
    bbox,
}: {
    nodeCanvas?: Canvas;
    bbox?: { x: number; y: number; width: number; height: number };
}) {
    let sourceCanvas = nodeCanvas;
    if (bbox) {
        const { x, y, width, height } = bbox;
        sourceCanvas = createCanvas(width, height);
        sourceCanvas
            .getContext('2d')
            .drawImage(
                nodeCanvas,
                Math.round(x),
                Math.round(y),
                Math.round(width),
                Math.round(height),
                0,
                0,
                Math.round(width),
                Math.round(height)
            );
    }

    return sourceCanvas.toBuffer('image/png', CANVAS_TO_BUFFER_DEFAULTS);
}

export function setupMockCanvas(): { nodeCanvas?: Canvas } {
    let realCreateElement: typeof document.createElement;
    let ctx: { nodeCanvas?: Canvas } = {};
    let canvasStack: Canvas[] = [];
    let canvases: Canvas[] = [];

    beforeEach(() => {
        resetIds();
        ctx.nodeCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvasStack = [ctx.nodeCanvas];
        window['agChartsSceneRenderModel'] = 'composite';

        realCreateElement = document.createElement;
        document.createElement = jest.fn((element, options) => {
            if (element === 'canvas') {
                const mockedElement: HTMLCanvasElement = realCreateElement.call(document, element, options);

                let [nextCanvas] = canvasStack.splice(0, 1);
                if (!nextCanvas) {
                    nextCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
                }
                canvases.push(nextCanvas);

                mockedElement.getContext = (p) => {
                    const context2d = nextCanvas.getContext(p, { alpha: true });
                    context2d.patternQuality = 'good';
                    context2d.quality = 'good';
                    context2d.textDrawingMode = 'path';
                    context2d.antialias = 'subpixel';

                    return context2d as any;
                };

                return mockedElement;
            }

            return realCreateElement.call(document, element, options);
        });
    });

    afterEach(() => {
        document.createElement = realCreateElement;
        ctx.nodeCanvas = null;
        canvasStack = [];
        canvases = [];
    });

    return ctx;
}

export function toMatchImage(actual, expected) {
    // Grab values from enclosing Jest scope.
    const { testPath, currentTestName } = this;

    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    const diff = new PNG({ width, height });
    const result = pixelmatch(actual, expected, diff.data, width, height, { threshold: 0.01 });

    const diffOutputFilename = `${testPath.substring(
        0,
        testPath.lastIndexOf('/')
    )}/__image_snapshots__/${currentTestName}-diff.png`;
    const diffPercentage = (result * 100) / (width * height);
    const pass = diffPercentage <= 0.05;

    if (!pass) {
        fs.writeFileSync(diffOutputFilename, (PNG as any).sync.write(diff));
    } else if (fs.existsSync(diffOutputFilename)) {
        fs.unlinkSync(diffOutputFilename);
    }

    return { message: () => `Images were ${result} (${diffPercentage.toFixed(2)}%) pixels different`, pass };
}
