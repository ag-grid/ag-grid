import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart, AgChartOptions, _ModuleSupport } from '@ag-charts-enterprise/core';
import { ZoomModule } from './chartZoomModule';
import {
    waitForChartStability,
    setupMockCanvas,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    extractImageData,
    scrollAction,
    IMAGE_SNAPSHOT_DEFAULTS,
} from 'ag-charts-community/src/chart/test/utils';

expect.extend({ toMatchImageSnapshot });

_ModuleSupport.registerModule(ZoomModule);

describe('Zoom', () => {
    let chart: any;
    const ctx = setupMockCanvas();

    beforeEach(() => {
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

    const EXAMPLE_OPTIONS: AgChartOptions = {
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
        },
    };

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    describe('when a user scrolls the mouse wheel', () => {
        const cx = CANVAS_WIDTH / 2;
        const cy = CANVAS_HEIGHT / 2;

        beforeEach(async () => {
            const options: AgChartOptions = { ...EXAMPLE_OPTIONS };
            options.autoSize = false;
            options.width = CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;

            chart = AgChart.create(options);
        });

        it('should zoom in', async () => {
            await scrollAction(cx, cy, -1);
            await scrollAction(cx, cy, -1);
            await scrollAction(cx, cy, -1);
            await scrollAction(cx, cy, -1);
            await compare();
        });

        it('should zoom in then out', async () => {
            await scrollAction(cx, cy, -1);
            await scrollAction(cx, cy, -1);
            await scrollAction(cx, cy, 1);
            await scrollAction(cx, cy, 1);
            await compare();
        });
    });

    describe('when a user clicks and drags', () => {
        it.skip('should zoom in to fit the drawn rect', () => {
            //
        });
    });

    describe('when a user holds the pan key and clicks and drags', () => {
        it.skip('should not pan a unit-zoom state', () => {
            //
        });

        it.skip('should pan when zoomed in', () => {
            //
        });
    });
});
