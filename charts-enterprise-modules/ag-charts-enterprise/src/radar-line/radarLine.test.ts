import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChartOptions, AgEnterpriseCharts, _ModuleSupport } from '../main';

import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    prepareTestOptions,
} from 'ag-charts-community-test';

expect.extend({ toMatchImageSnapshot });

describe('Radar Line sChart', () => {
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
            { subject: 'Maths', grade: 7.0 },
            { subject: 'Physics', grade: 4.3 },
            { subject: 'Biology', grade: 3.0 },
            { subject: 'History', grade: 6.5 },
            { subject: 'P.E.', grade: 9.8 },
        ],
        series: [
            {
                type: 'radar-line',
                angleKey: 'subject',
                radiusKey: 'grade',
                stroke: 'red',
                strokeWidth: 2,
                marker: {
                    fill: 'red',
                    size: 10,
                },
            },
        ],
        legend: {
            enabled: true,
        },
        axes: [
            {
                type: 'polar-angle-category',
            },
            {
                type: 'polar-radius-number',
            },
        ],
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
