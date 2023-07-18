import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart } from './../chart/agChartV2';
import * as examples from '../chart/test/examples';
import { extractImageData, waitForChartStability, setupMockCanvas, IMAGE_SNAPSHOT_DEFAULTS } from '../chart/test/utils';
import type { AgCartesianChartOptions, AgChartBaseLegendOptions, AgChartInstance } from '../chart/agChartOptions';

expect.extend({ toMatchImageSnapshot });

describe('Scene', () => {
    let chart: AgChartInstance;

    const ctx = setupMockCanvas();

    beforeEach(() => {
        console.warn = jest.fn();
    });

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
        expect(console.warn).not.toBeCalled();
    });

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    describe('on translation only change', () => {
        it(`should render bar series correctly after update`, async () => {
            const options: AgCartesianChartOptions = {
                ...examples.STACKED_BAR_CHART_EXAMPLE,
                legend: { position: 'bottom' },
            };
            chart = AgChart.create(options);
            await waitForChartStability(chart);

            (options.legend as AgChartBaseLegendOptions).position = 'top';
            AgChart.update(chart, options);

            await compare();
        });

        it(`should render line series correctly after update`, async () => {
            const options: AgCartesianChartOptions = {
                ...examples.SIMPLE_LINE_CHART_EXAMPLE,
                legend: { position: 'bottom' },
            };
            chart = AgChart.create(options);
            await waitForChartStability(chart);

            (options.legend as AgChartBaseLegendOptions).position = 'top';
            AgChart.update(chart, options);

            await compare();
        });
    });
});
