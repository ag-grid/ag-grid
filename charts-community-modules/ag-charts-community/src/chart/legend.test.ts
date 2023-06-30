import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart } from './agChartV2';
import type { CartesianChart } from './cartesianChart';
import type { Chart } from './chart';
import {
    waitForChartStability,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    deproxy,
    clickAction,
    doubleClickAction,
    prepareTestOptions,
} from './test/utils';
import * as examples from './test/examples';
import type { AgCartesianChartOptions } from './agChartOptions';
import { seedRandom } from './test/random';

expect.extend({ toMatchImageSnapshot });

function buildSeries(data: { x: number; y: number }) {
    return {
        data: [data],
        xKey: 'x',
        yKey: 'y',
        yName: String(data.x),
    };
}

const SERIES: { data: { x: number; y: number }[]; xKey: string; yKey: string; yName: string }[] = [];
const seriesDataRandom = seedRandom(10763960837);

for (let i = 0; i < 200; i++) {
    SERIES.push(buildSeries({ x: i, y: Math.floor(seriesDataRandom() * 100) }));
}

const OPTIONS: AgCartesianChartOptions = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Browser Usage Statistics',
    },
    subtitle: {
        text: '2009-2019',
    },
    series: SERIES,
};

describe('Legend', () => {
    let chart: CartesianChart;

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

    const ctx = setupMockCanvas();

    const compare = async (chart: Chart) => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    describe('Large series count chart', () => {
        it.each([800, 600, 400, 200])('should render legend correctly at width [%s]', async (width) => {
            const options = {
                ...examples.LINE_GRAPH_WITH_GAPS_EXAMPLE,
            };

            prepareTestOptions(options);
            options.width = width ?? options.width;

            chart = deproxy(AgChart.create(options)) as CartesianChart;
            await compare(chart);
        });
    });

    describe('Large series count chart legend pagination', () => {
        const positions = ['right' as const, 'bottom' as const];

        it.each(positions)('should render legend correctly at position [%s]', async (position) => {
            const options = {
                ...OPTIONS,
                legend: {
                    position,
                },
            };
            prepareTestOptions(options);

            chart = deproxy(AgChart.create(options)) as CartesianChart;
            await compare(chart);
        });
    });

    describe('Clicking a legend', () => {
        it('should hide the related series', async () => {
            const options = {
                ...examples.GROUPED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
            };

            prepareTestOptions(options);

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);

            const { x = 0, y = 0 } = chart.legend?.computeBBox() ?? {};
            await clickAction(x, y)(chart);

            await compare(chart);
        });

        it('when clicked twice should hide and re-show the related series', async () => {
            const options = {
                ...examples.GROUPED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
            };

            prepareTestOptions(options);

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            const { x = 0, y = 0 } = chart.legend?.computeBBox() ?? {};

            await clickAction(x, y)(chart);
            await waitForChartStability(chart);
            await clickAction(x, y)(chart);

            await compare(chart);
        });
    });

    describe('Double clicking a legend', () => {
        it('should hide all other series except this one', async () => {
            const options = {
                ...examples.GROUPED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
            };

            prepareTestOptions(options);

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            const { x = 0, y = 0 } = chart.legend?.computeBBox() ?? {};

            await doubleClickAction(x, y)(chart);

            await compare(chart);
        });

        it('when double clicked twice should show all series', async () => {
            const options = {
                ...examples.GROUPED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
            };

            prepareTestOptions(options);

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            const { x = 0, y = 0 } = chart.legend?.computeBBox() ?? {};

            await doubleClickAction(x, y)(chart);
            await waitForChartStability(chart);

            // Click the legend item again for some reason... why does this test require this?
            await clickAction(x, y)(chart);
            await waitForChartStability(chart);

            await doubleClickAction(x, y)(chart);

            await compare(chart);
        });
    });
});
