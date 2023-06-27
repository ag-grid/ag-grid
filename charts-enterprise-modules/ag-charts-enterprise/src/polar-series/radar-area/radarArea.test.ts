import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChartOptions, AgEnterpriseCharts, _ModuleSupport } from '../../main';

import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    prepareTestOptions,
} from 'ag-charts-community-test';

expect.extend({ toMatchImageSnapshot });

describe('Radar Area Chart', () => {
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
            { subject: 'Maths', gradeA: 7.0, gradeB: 4.2 },
            { subject: 'Physics', gradeA: 4.3, gradeB: 8.5 },
            { subject: 'Biology', gradeA: 3.0, gradeB: 3.0 },
            { subject: 'History', gradeA: 6.5, gradeB: 4.3 },
            { subject: 'P.E.', gradeA: 9.8, gradeB: 6.4 },
        ],
        series: [
            {
                type: 'radar-area',
                angleKey: 'subject',
                radiusKey: 'gradeA',
            },
            {
                type: 'radar-area',
                angleKey: 'subject',
                radiusKey: 'gradeB',
            },
        ],
        legend: {
            enabled: true,
        },
    };

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    it(`should render polar chart as expected`, async () => {
        const options: AgChartOptions = { ...EXAMPLE_OPTIONS };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render polar chart with circle axes as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                { type: 'angle-category', shape: 'circle' },
                { type: 'radius-number', shape: 'circle' },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should avoid polar chart label collisions`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            data: Array.from({ length: 95 }).map((_, i) => ({
                subject: `Subject ${i}`,
                gradeA: 2 * ((i % 5) + 1),
                gradeB: 2 * (((i + 3) % 5) + 1),
            })),
            axes: [
                { type: 'angle-category', label: { avoidCollisions: true, minSpacing: 2 } },
                { type: 'radius-number' },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });
});
