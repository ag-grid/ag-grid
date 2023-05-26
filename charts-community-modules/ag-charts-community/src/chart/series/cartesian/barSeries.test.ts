import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChartOptions } from '../../agChartOptions';
import { AgChart } from '../../agChartV2';
import { Chart } from '../../chart';
import {
    DATA_FRACTIONAL_LOG_AXIS,
    DATA_INVALID_DOMAIN_LOG_AXIS,
    DATA_NEGATIVE_LOG_AXIS,
    DATA_POSITIVE_LOG_AXIS,
    DATA_ZERO_EXTENT_LOG_AXIS,
} from '../../test/data';
import * as examples from '../../test/examples';
import {
    waitForChartStability,
    cartesianChartAssertions,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    TestCase,
    prepareTestOptions,
    spyOnAnimationManager,
} from '../../test/utils';

expect.extend({ toMatchImageSnapshot });

const buildLogAxisTestCase = (data: any[]): TestCase => {
    return {
        options: examples.CARTESIAN_CATEGORY_X_AXIS_LOG_Y_AXIS(data, 'column'),
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'log'], seriesTypes: ['column'] }),
    };
};

const EXAMPLES: Record<string, TestCase> = {
    COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['column'] }),
    },
    COLUMN_TIME_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.COLUMN_TIME_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['column'] }),
    },
    STACKED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.STACKED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['column'] }),
    },
    GROUPED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.GROUPED_COLUMN_NUMBER_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['column'] }),
    },
    BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['bar'] }),
    },
    BAR_TIME_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.BAR_TIME_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['bar'] }),
    },
    STACKED_BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.STACKED_BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['bar'] }),
    },
    GROUPED_BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.GROUPED_BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['bar'] }),
    },
    COLUMN_CATEGORY_X_AXIS_POSITIVE_LOG_Y_AXIS: buildLogAxisTestCase(DATA_POSITIVE_LOG_AXIS),
    COLUMN_CATEGORY_X_AXIS_NEGATIVE_LOG_Y_AXIS: buildLogAxisTestCase(DATA_NEGATIVE_LOG_AXIS),
    COLUMN_CATEGORY_X_AXIS_FRACTIONAL_LOG_Y_AXIS: buildLogAxisTestCase(DATA_FRACTIONAL_LOG_AXIS),
    COLUMN_CATEGORY_X_AXIS_ZERO_EXTENT_LOG_Y_AXIS: buildLogAxisTestCase(DATA_ZERO_EXTENT_LOG_AXIS),
};

const INVALID_DATA_EXAMPLES: Record<string, TestCase> = {
    COLUMN_CATEGORY_X_AXIS_INVALID_DOMAIN_LOG_Y_AXIS: buildLogAxisTestCase(DATA_INVALID_DOMAIN_LOG_AXIS),
};

describe('BarSeries', () => {
    let chart: Chart;

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
    });

    const ctx = setupMockCanvas();

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
                prepareTestOptions(options);

                chart = AgChart.create(options) as Chart;
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
                prepareTestOptions(options);

                chart = AgChart.create(options) as Chart;
                await compare();

                if (example.extraScreenshotActions) {
                    await example.extraScreenshotActions(chart);
                    await compare();
                }
            });
        }
    });

    describe('initial animation', () => {
        const compare = async () => {
            await waitForChartStability(chart);

            const imageData = extractImageData(ctx);
            (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
        };

        afterEach(() => {
            jest.restoreAllMocks();
        });

        for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
            it(`for COLUMN_TIME_X_AXIS_NUMBER_Y_AXIS should animate at ${ratio * 100}%`, async () => {
                spyOnAnimationManager(1000, ratio);

                const options: AgChartOptions = { ...examples.COLUMN_TIME_X_AXIS_NUMBER_Y_AXIS };
                prepareTestOptions(options);

                chart = AgChart.create(options) as Chart;
                await waitForChartStability(chart);
                await compare();
            });
        }

        for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
            it(`for BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS should animate at ${ratio * 100}%`, async () => {
                spyOnAnimationManager(1000, ratio);

                const options: AgChartOptions = { ...examples.BAR_NUMBER_X_AXIS_NUMBER_Y_AXIS };
                prepareTestOptions(options);

                chart = AgChart.create(options) as Chart;
                await waitForChartStability(chart);
                await compare();
            });
        }
    });

    describe('invalid data domain', () => {
        beforeEach(() => {
            console.warn = jest.fn();
        });

        for (const [exampleName, example] of Object.entries(INVALID_DATA_EXAMPLES)) {
            it(`for ${exampleName} it should create chart instance as expected`, async () => {
                const options: AgChartOptions = { ...example.options };
                prepareTestOptions(options);

                chart = AgChart.create(options) as Chart;
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
                prepareTestOptions(options);

                chart = AgChart.create(options) as Chart;
                await compare();

                if (example.extraScreenshotActions) {
                    await example.extraScreenshotActions(chart);
                    await compare();
                }

                expect(console.warn).toBeCalled();
            });
        }
    });
});
