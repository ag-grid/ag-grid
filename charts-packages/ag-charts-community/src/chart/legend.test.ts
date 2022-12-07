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

expect.extend({ toMatchImageSnapshot });

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

    let ctx = setupMockCanvas();

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
});
