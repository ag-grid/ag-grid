import { expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Chart } from "../chart";
import { CartesianChart } from '../cartesianChart';
import { PolarChart } from '../polarChart';
import { HierarchyChart } from '../hierarchyChart';
import { Canvas, createCanvas, PngConfig } from 'canvas';

export const IMAGE_SNAPSHOT_DEFAULTS = { failureThreshold: 10, failureThresholdType: "percent" };
export const CANVAS_TO_BUFFER_DEFAULTS: PngConfig = { compressionLevel: 0, filters: (Canvas as any).PNG_NO_FILTERS };

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
        ctx.nodeCanvas = createCanvas(800, 600);

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
