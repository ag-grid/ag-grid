import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import type { AgChartOptions } from '../../agChartOptions';
import { AgChart } from '../../agChartV2';
import type { Chart } from '../../chart';
import {
    DATA_FRACTIONAL_LOG_AXIS,
    DATA_INVALID_DOMAIN_LOG_AXIS,
    DATA_NEGATIVE_LOG_AXIS,
    DATA_POSITIVE_LOG_AXIS,
    DATA_ZERO_EXTENT_LOG_AXIS,
} from '../../test/data';
import * as examples from '../../test/examples';
import {
    repeat,
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
        options: examples.CARTESIAN_CATEGORY_X_AXIS_LOG_Y_AXIS(data, 'area'),
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'log'], seriesTypes: ['area'] }),
    };
};

const EXAMPLES: Record<string, TestCase & { skip?: boolean }> = {
    AREA_MISSING_Y_DATA_EXAMPLE: {
        options: examples.AREA_MISSING_Y_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: ['area'] }),
    },
    STACKED_AREA_MISSING_Y_DATA_EXAMPLE: {
        options: examples.STACKED_AREA_MISSING_Y_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number'],
            seriesTypes: repeat('area', 4),
        }),
    },
    AREA_NUMBER_X_AXIS_MISSING_X_DATA_EXAMPLE: {
        options: examples.AREA_NUMBER_X_AXIS_MISSING_X_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['area'] }),
    },
    AREA_TIME_X_AXIS_MISSING_X_DATA_EXAMPLE: {
        options: examples.AREA_TIME_X_AXIS_MISSING_X_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['area'] }),
    },
    STACKED_AREA_NUMBER_X_AXIS_MISSING_X_DATA_EXAMPLE: {
        options: examples.STACKED_AREA_NUMBER_X_AXIS_MISSING_X_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: repeat('area', 2) }),
    },
    STACKED_AREA_TIME_X_AXIS_MISSING_X_DATA_EXAMPLE: {
        options: examples.STACKED_AREA_TIME_X_AXIS_MISSING_X_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('area', 2) }),
    },
    AREA__TIME_X_AXIS_NUMBER_Y_AXIS: {
        options: examples.AREA_TIME_X_AXIS_NUMBER_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('area', 2) }),
    },
    AREA_NUMBER_X_AXIS_TIME_Y_AXIS: {
        options: examples.AREA_NUMBER_X_AXIS_TIME_Y_AXIS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'time'], seriesTypes: repeat('area', 2) }),
        skip: true,
    },
    AREA_NUMBER_AXES_0_X_DOMAIN: {
        options: examples.AREA_NUMBER_AXES_0_X_DOMAIN,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: repeat('area', 2) }),
    },
    AREA_NUMBER_AXES_0_Y_DOMAIN: {
        options: examples.AREA_NUMBER_AXES_0_Y_DOMAIN,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: repeat('area', 2) }),
    },
    STACKED_AREA_STROKE_MARKER_LABEL_RENDERING: {
        options: {
            ...examples.STACKED_AREA_MISSING_Y_DATA_EXAMPLE,
            series: (examples.STACKED_AREA_MISSING_Y_DATA_EXAMPLE.series ?? []).map((s) => ({
                ...s,
                strokeWidth: 20,
                marker: { size: 15 },
                label: {},
            })),
        },
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number'],
            seriesTypes: repeat('area', 4),
        }),
    },
    STACKED_AREA_MISSING_FIRST_Y_DATA_EXAMPLE: {
        options: examples.STACKED_AREA_MISSING_FIRST_Y_DATA_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: repeat('area', 2) }),
    },
    AREA_CATEGORY_X_AXIS_POSITIVE_LOG_Y_AXIS: buildLogAxisTestCase(DATA_POSITIVE_LOG_AXIS),
    AREA_CATEGORY_X_AXIS_NEGATIVE_LOG_Y_AXIS: buildLogAxisTestCase(DATA_NEGATIVE_LOG_AXIS),
    AREA_CATEGORY_X_AXIS_FRACTIONAL_LOG_Y_AXIS: buildLogAxisTestCase(DATA_FRACTIONAL_LOG_AXIS),
    AREA_CATEGORY_X_AXIS_ZERO_EXTENT_LOG_Y_AXIS: buildLogAxisTestCase(DATA_ZERO_EXTENT_LOG_AXIS),
};

const INVALID_DATA_EXAMPLES: Record<string, TestCase> = {
    AREA_CATEGORY_X_AXIS_INVALID_DOMAIN_LOG_Y_AXIS: buildLogAxisTestCase(DATA_INVALID_DOMAIN_LOG_AXIS),
};

describe('AreaSeries', () => {
    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

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
            if (example.skip === true) {
                it.skip(`for ${exampleName} it should create chart instance as expected`, async () => {});
                it.skip(`for ${exampleName} it should render to canvas as expected`, async () => {});
            } else {
                it(`for ${exampleName} it should create chart instance as expected`, async () => {
                    const options: AgChartOptions = { ...example.options };
                    prepareTestOptions(options);

                    chart = AgChart.create(options) as Chart;
                    await waitForChartStability(chart);
                    await example.assertions(chart);
                });

                it(`for ${exampleName} it should render to canvas as expected`, async () => {
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
        }
    });

    describe('initial animation', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
            it(`for AREA_CATEGORY_X_AXIS_FRACTIONAL_LOG_Y_AXIS should animate at ${ratio * 100}%`, async () => {
                spyOnAnimationManager(1200, ratio);

                const options: AgChartOptions = examples.CARTESIAN_CATEGORY_X_AXIS_LOG_Y_AXIS(
                    DATA_FRACTIONAL_LOG_AXIS,
                    'area'
                );
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

    describe('multiple overlapping areas', () => {
        beforeEach(() => {
            console.warn = jest.fn();
        });

        it('should render area series with the correct relative Z-index', async () => {
            const options: AgChartOptions = {
                data: repeat(null, 30).reduce(
                    (result, _, i) => [
                        {
                            ...(result[0] ?? {}),
                            [`x${i}`]: 0,
                            [`y${i}`]: i,
                        },
                        {
                            ...(result[1] ?? {}),
                            [`x${i}`]: 1,
                            [`y${i}`]: 30 - i,
                        },
                    ],
                    [{}, {}]
                ),
                series: repeat(null, 30).map((_, i) => ({
                    type: 'area',
                    xKey: `x${i}`,
                    yKey: `y${i}`,
                    strokeWidth: 2,
                })),
                legend: { enabled: false },
            };

            prepareTestOptions(options);

            chart = AgChart.create(options) as Chart;
            await compare();
        });
    });
});
