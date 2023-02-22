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
            await waitForChartStability(chart);
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
});
