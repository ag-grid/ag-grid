import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart, AgChartOptions, _ModuleSupport } from 'ag-charts-community';
import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    hoverAction,
    prepareTestOptions,
} from 'ag-charts-community/src/chart/test/utils';

import { CrosshairModule } from './crosshairModule';

expect.extend({ toMatchImageSnapshot });

_ModuleSupport.registerModule(CrosshairModule);

describe('Chart', () => {
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
        ],
        series: [{ type: 'line', xKey: 'x', yKey: 'y' }],
        axes: [
            { type: 'number', position: 'left', crosshair: {} },
            { type: 'number', position: 'bottom', crosshair: {} },
        ],
    };

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    it(`should render placeholder chart as expected`, async () => {
        const options: AgChartOptions = { ...EXAMPLE_OPTIONS };
        prepareTestOptions(options);

        chart = AgChart.create(options);
        await waitForChartStability(chart);
        await hoverAction(300, 300)(chart);
        await compare();
    });
});
