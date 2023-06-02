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

    const WATERFALL_COLUMN_OPTIONS: AgChartOptions = {
        data: [
            { year: '2020', spending: 10 },
            { year: '2021', spending: 20 },
            { year: '2022', spending: 30 },
            { year: '2023', spending: -20 },
            { year: '2024', spending: -30 },
            { year: '2025', spending: 40 },
            { year: '2026', spending: -30 },
            { year: '2027', spending: 40 },
            { year: '2028', spending: 50 },
        ],
        series: [
            {
                type: 'waterfall-column',
                xKey: 'year',
                yKey: 'spending',
                label: {
                    enabled: true,
                    placement: 'inside',
                },
                positiveItem: {
                    fill: '#91CC75',
                    stroke: '#91CC75',
                    name: 'Revenue',
                },
                negativeItem: {
                    fill: '#D21E75',
                    stroke: '#D21E75',
                    name: 'Product Cost',
                },
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

    function switchSeriesType<T>(opts: T, type: 'waterfall-bar' | 'waterfall-column'): T {
        return {
            ...opts,
            series: opts['series']?.map((s) => ({
                ...s,
                type,
            })),
        };
    }

    it(`should render a waterfall-column chart as expected`, async () => {
        const options: AgChartOptions = { ...WATERFALL_COLUMN_OPTIONS };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render a waterfall-bar chart as expected`, async () => {
        const options: AgChartOptions = { ...switchSeriesType(WATERFALL_COLUMN_OPTIONS, 'waterfall-bar') };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });
});
