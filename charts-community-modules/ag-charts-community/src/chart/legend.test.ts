import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChart } from './agChartV2';
import { CartesianChart } from './cartesianChart';
import { Chart } from './chart';
import {
    waitForChartStability,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    deproxy,
    clickAction,
    doubleClickAction,
} from './test/utils';
import * as examples from './test/examples';
import { AgCartesianChartOptions } from './agChartOptions';
import { seedRandom } from './test/random';

expect.extend({ toMatchImageSnapshot });

function buildSeries(data) {
    return {
        data: [data],
        xKey: 'x',
        yKey: 'y',
        yName: String(data.y),
    };
}

const SERIES = [];
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

            options.autoSize = false;
            options.width = width ?? CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;

            chart = deproxy(AgChart.create(options)) as CartesianChart;
            await compare(chart);
        });
    });

    describe('Large series count chart legend pagination', () => {
        const positions = ['right', 'bottom'];

        it.each(positions)('should render legend correctly at position [%s]', async (position) => {
            const options = {
                ...OPTIONS,
                autoSize: false,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                legend: {
                    position,
                },
            };

            chart = deproxy(AgChart.create(options)) as CartesianChart;
            await compare(chart);
        });
    });

    // Coords for `Chrome` legend item
    const legendItemCoords = { x: 720, y: 284 };
    const clickLegendItem = clickAction(legendItemCoords.x, legendItemCoords.y);
    const doubleClickLegendItem = doubleClickAction(legendItemCoords.x, legendItemCoords.y);

    describe('Clicking a legend', () => {
        it('should hide the related series', async () => {
            const options = {
                ...examples.PIE_IN_A_DOUGHNUT,
            };

            options.autoSize = false;
            options.width = CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;
            options.container = document.body;

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            await clickLegendItem(chart);

            await compare(chart);
        });

        it('when clicked twice should hide and re-show the related series', async () => {
            const options = {
                ...examples.PIE_IN_A_DOUGHNUT,
            };

            options.autoSize = false;
            options.width = CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;
            options.container = document.body;

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            await clickLegendItem(chart);
            await waitForChartStability(chart);
            await clickLegendItem(chart);

            await compare(chart);
        });
    });

    describe('Double clicking a legend', () => {
        it('should hide all other series except this one', async () => {
            const options = {
                ...examples.PIE_IN_A_DOUGHNUT,
            };

            options.autoSize = false;
            options.width = CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;
            options.container = document.body;

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            await doubleClickLegendItem(chart);

            await compare(chart);
        });

        it('when double clicked twice should show all series', async () => {
            const options = {
                ...examples.PIE_IN_A_DOUGHNUT,
            };

            options.autoSize = false;
            options.width = CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;
            options.container = document.body;

            chart = deproxy(AgChart.create(options)) as CartesianChart;

            await waitForChartStability(chart);
            await doubleClickLegendItem(chart);
            await waitForChartStability(chart);

            // Click the legend item again for some reason... why does this test require this?
            await clickLegendItem(chart);
            await waitForChartStability(chart);

            await doubleClickLegendItem(chart);

            await compare(chart);
        });
    });
});
