import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    cartesianChartAssertions,
    extractImageData,
    hierarchyChartAssertions,
    IMAGE_SNAPSHOT_DEFAULTS,
    polarChartAssertions,
    repeat,
    setupMockCanvas,
    TestCase,
    waitForChartStability,
} from '../test/utils';
import { AgChartOptions } from '../agChartOptions';
import { AgChart } from '../agChartV2';
import * as examples from './test/examples';
import { Chart } from '../chart';

expect.extend({ toMatchImageSnapshot });

const EXAMPLES: Record<string, TestCase> = {
    COLUMN_SERIES_LABELS: {
        options: examples.COLUMN_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
    STACKED_COLUMN_SERIES_LABELS: {
        options: examples.STACKED_COLUMN_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
    GROUPED_COLUMN_SERIES_LABELS: {
        options: examples.GROUPED_COLUMN_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
    BAR_SERIES_LABELS: {
        options: examples.BAR_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
    STACKED_BAR_SERIES_LABELS: {
        options: examples.STACKED_BAR_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
    GROUPED_BAR_SERIES_LABELS: {
        options: examples.GROUPED_BAR_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
    AREA_SERIES_LABELS: {
        options: examples.AREA_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['area'] }),
    },
    STACKED_AREA_SERIES_LABELS: {
        options: examples.STACKED_AREA_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['area'] }),
    },
    GROUPED_AREA_SERIES_LABELS: {
        options: examples.GROUPED_AREA_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: repeat('area', 3) }),
    },
    LINE_SERIES_LABELS: {
        options: examples.LINE_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: repeat('line', 3) }),
    },
    HISTOGRAM_SERIES_LABELS: {
        options: examples.HISTOGRAM_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['histogram'] }),
    },
    SCATTER_SERIES_LABELS: {
        options: examples.SCATTER_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    GROUPED_SCATTER_SERIES_LABELS: {
        options: examples.GROUPED_SCATTER_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('scatter', 4) }),
    },
    BUBBLE_SERIES_LABELS: {
        options: examples.BUBBLE_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    GROUPED_BUBBLE_SERIES_LABELS: {
        options: examples.GROUPED_BUBBLE_SERIES_LABELS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: repeat('scatter', 2) }),
    },
    PIE_SERIES_LABELS: {
        options: examples.PIE_SERIES_LABELS,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    DOUGHNUT_SERIES_LABELS: {
        options: examples.DOUGHNUT_SERIES_LABELS,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    GROUPED_DOUGHNUT_SERIES_LABELS: {
        options: examples.GROUPED_DOUGHNUT_SERIES_LABELS,
        assertions: polarChartAssertions({ seriesTypes: repeat('pie', 2) }),
    },
    TREEMAP_SERIES_LABELS: {
        options: examples.TREEMAP_SERIES_LABELS,
        assertions: hierarchyChartAssertions({ seriesTypes: ['treemap'] }),
    },
    LINE_COLUMN_COMBO_SERIES_LABELS: {
        options: examples.LINE_COLUMN_COMBO_SERIES_LABELS,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number', 'number'],
            seriesTypes: ['bar', 'line'],
        }),
    },
    AREA_COLUMN_COMBO_SERIES_LABELS: {
        options: examples.AREA_COLUMN_COMBO_SERIES_LABELS,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number', 'number'],
            seriesTypes: ['area', 'bar'],
        }),
    },
    HISTOGRAM_SCATTER_COMBO_SERIES_LABELS: {
        options: examples.HISTOGRAM_SCATTER_COMBO_SERIES_LABELS,
        assertions: cartesianChartAssertions({
            axisTypes: ['number', 'number', 'number'],
            seriesTypes: ['histogram', 'scatter'],
        }),
    },
};

describe('series labels', () => {
    let chart: Chart;

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
    });

    let ctx = setupMockCanvas();

    describe('#create', () => {
        beforeEach(() => {
            console.warn = jest.fn();
        });

        afterEach(() => {
            expect(console.warn).not.toBeCalled();
        });

        for (const [exampleName, example] of Object.entries(EXAMPLES)) {
            it(`for ${exampleName} it should create chart instance as expected`, async () => {
                const options: AgChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChart.create<any>(options) as Chart;
                await waitForChartStability(chart);
                await example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const compare = async () => {
                    await waitForChartStability(chart);

                    const imageData = extractImageData(ctx);
                    (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
                };

                const options: AgChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChart.create<any>(options) as Chart;
                await compare();
            });
        }
    });
});
