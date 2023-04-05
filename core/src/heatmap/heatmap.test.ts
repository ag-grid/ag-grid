import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChartOptions, AgEnterpriseCharts, _ModuleSupport } from '../main';

import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    prepareTestOptions,
} from 'ag-charts-community/dist/cjs/es5/main-test';

expect.extend({ toMatchImageSnapshot });

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
            { year: '2020', person: 'Florian', spending: 10 },
            { year: '2020', person: 'Julian', spending: 20 },
            { year: '2020', person: 'Martian', spending: 30 },
            { year: '2021', person: 'Florian', spending: 20 },
            { year: '2021', person: 'Julian', spending: 30 },
            { year: '2021', person: 'Martian', spending: 40 },
            { year: '2022', person: 'Florian', spending: 30 },
            { year: '2022', person: 'Julian', spending: 40 },
            { year: '2022', person: 'Martian', spending: 50 },
        ],
        series: [{
            type: 'heatmap',
            xKey: 'year',
            yKey: 'person',
            colorKey: 'spending',
            colorRange: ['yellow', 'red', 'blue'],
        }],
    };

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    it(`should render placeholder chart as expected`, async () => {
        const options: AgChartOptions = { ...EXAMPLE_OPTIONS };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });
});
