import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart, AgCartesianChartOptions, _ModuleSupport } from '@ag-charts-enterprise/core';
import { ZoomModule } from './chartZoomModule';
import {
    waitForChartStability,
    setupMockCanvas,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    extractImageData,
    scrollAction,
    IMAGE_SNAPSHOT_DEFAULTS,
    clickAction,
} from 'ag-charts-community/src/chart/test/utils';

expect.extend({ toMatchImageSnapshot });

_ModuleSupport.registerModule(ZoomModule);

describe('Zoom', () => {
    let chart: any;
    const ctx = setupMockCanvas();

    const EXAMPLE_OPTIONS: AgCartesianChartOptions = {
        autoSize: false,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
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

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    beforeEach(async () => {
        const options: AgCartesianChartOptions = { ...EXAMPLE_OPTIONS };
        chart = AgChart.create(options);

        // Click once in the chart to ensure the chart is active / mouse is over it to ensure the first scroll wheel
        // event is triggered.
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
            await scrollAction(cx + CANVAS_WIDTH / 4, cy + CANVAS_HEIGHT / 4, -1);

            await compare();
        });
    });
});
