import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart, AgCartesianChartOptions, _ModuleSupport } from '@ag-charts-enterprise/core';
import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    scrollAction,
    IMAGE_SNAPSHOT_DEFAULTS,
    clickAction,
    prepareTestOptions,
} from 'ag-charts-community/dist/cjs/es5/main-test';
import { ZoomModule } from './chartZoomModule';

expect.extend({ toMatchImageSnapshot });

_ModuleSupport.registerModule(ZoomModule);

describe('Zoom', () => {
    let chart: any;
    const ctx = setupMockCanvas();

    const EXAMPLE_OPTIONS: AgCartesianChartOptions = {
        data: [
            { x: 0, y: 0 },
            { x: 1, y: 50 },
            { x: 2, y: 25 },
            { x: 3, y: 75 },
            { x: 4, y: 50 },
            { x: 5, y: 25 },
            { x: 6, y: 50 },
            { x: 7, y: 75 },
        ],
        series: [{ type: 'line', xKey: 'x', yKey: 'y' }],
        zoom: {
            enabled: true,
            scrollingStep: 0.5, // Make sure we zoom enough in a single step so we can detect it
        },
    };

    let cx: number = 0;
    let cy: number = 0;

    beforeEach(async () => {
        const options: AgCartesianChartOptions = { ...EXAMPLE_OPTIONS };
        prepareTestOptions(options);
        cx = options.width! / 2;
        cy = options.height! / 2;

        chart = AgChart.create(options);

        // Click once in the chart to ensure the chart is active / mouse is over it to ensure the first scroll wheel
        // event is triggered.
        await waitForChartStability(chart);
        await clickAction(cx, cy)(chart);

        // eslint-disable-next-line no-console
        console.warn = jest.fn();
    });

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
        // eslint-disable-next-line no-console
        expect(console.warn).not.toBeCalled();
    });

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    describe('when a user scrolls the mouse wheel', () => {
        it('should zoom in', async () => {
            await scrollAction(cx, cy, -1);

            await compare();
        });

        it('should zoom in then out', async () => {
            await scrollAction(cx, cy, -1);
            await scrollAction(cx, cy, 1);

            await compare();
        });

        it('should zoom in to the given location', async () => {
            await scrollAction(cx * 1.5, cy * 1.5, -1);

            await compare();
        });
    });
});
