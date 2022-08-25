import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { AgChartOptions } from '../agChartOptions';
import { AgChartV2 } from '../agChartV2';
import { Chart, ChartUpdateType } from '../chart';
import { ChartAxis, ChartAxisPosition, ChartAxisDirection } from '../chartAxis';
import * as examples from '../test/examples-axes';
import {
    waitForChartStability,
    cartesianChartAssertions,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    toMatchImage,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
} from '../test/utils';

expect.extend({ toMatchImageSnapshot, toMatchImage });

function applyRotation<T>(opts: T, rotation: number): T {
    return {
        ...opts,
        axes: opts['axes']?.map((axis) => ({ ...axis, label: { ...axis.label, rotation } })) || undefined,
    };
}

function applyAxesFlip<T>(opts: T): T {
    const positionFlip = (position: ChartAxisPosition) => {
        switch (position) {
            case 'top':
                return 'bottom';
            case 'left':
                return 'right';
            case 'bottom':
                return 'top';
            case 'right':
                return 'left';
            default:
                return position;
        }
    };

    return {
        ...opts,
        axes: opts['axes']?.map((axis) => ({ ...axis, position: positionFlip(axis.position) })) || undefined,
    };
}

type TestCase = {
    options: AgChartOptions;
    assertions: (chart: Chart) => Promise<void>;
    extraScreenshotActions?: (chart: Chart) => Promise<void>;
};
const EXAMPLES = mixinDerivedCases({
    BASIC_CATEGORY_AXIS: {
        options: examples.CATEGORY_AXIS_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    BASIC_CATEGORY_UNIFORM_AXIS: {
        options: examples.CATEGORY_AXIS_UNIFORM_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    GROUPED_CATEGORY_AXIS: {
        options: examples.GROUPED_CATEGORY_AXIS_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['groupedCategory', 'number'] }),
    },
    BASIC_TIME_AXIS: {
        options: examples.TIME_AXIS_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['line'] }),
    },
    NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE: {
        options: examples.NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['line'] }),
    },
});

const EXAMPLES_NO_SERIES: Record<string, TestCase> = {
    NUMBER_AXIS_NO_SERIES: {
        options: examples.NUMBER_AXIS_NO_SERIES,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    NUMBER_AXIS_NO_SERIES_FIXED_DOMAIN: {
        options: examples.NUMBER_AXIS_NO_SERIES_FIXED_DOMAIN,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    TIME_AXIS_NO_SERIES: {
        options: examples.TIME_AXIS_NO_SERIES,
        assertions: cartesianChartAssertions({
            axisTypes: ['time', 'number'],
            seriesTypes: ['line', 'line', 'line', 'line'],
        }),
    },
    TIME_AXIS_NO_SERIES_FIXED_DOMAIN: {
        options: examples.TIME_AXIS_NO_SERIES_FIXED_DOMAIN,
        assertions: cartesianChartAssertions({
            axisTypes: ['time', 'number'],
            seriesTypes: ['line', 'line', 'line', 'line'],
        }),
    },
    COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES: {
        options: examples.COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number', 'number'],
            seriesTypes: ['bar', 'line'],
        }),
    },
    COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES_FIXED_DOMAIN: {
        options: examples.COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES_FIXED_DOMAIN,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number', 'number'],
            seriesTypes: ['bar', 'line'],
        }),
    },
    AREA_CHART_NO_SERIES: {
        options: examples.AREA_CHART_NO_SERIES,
        assertions: cartesianChartAssertions({
            axisTypes: ['time', 'number'],
            seriesTypes: ['area'],
        }),
    },
    AREA_CHART_STACKED_NORMALISED_NO_SERIES: {
        options: examples.AREA_CHART_STACKED_NORMALISED_NO_SERIES,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number'],
            seriesTypes: ['area'],
        }),
    },
};

function mixinDerivedCases(baseCases: Record<string, TestCase>): Record<string, TestCase> {
    const result = { ...baseCases };

    Object.entries(baseCases).forEach(([name, baseCase]) => {
        // Add manual rotation.
        result[name + '_MANUAL_ROTATION'] = {
            ...baseCase,
            options: applyRotation(baseCase.options, -30),
        };

        // Add flipped axes.
        result[name + '_FLIP'] = {
            ...baseCase,
            options: applyAxesFlip(baseCase.options),
        };
    });

    return result;
}

function calculateAxisBBox(axis: ChartAxis<any>): { x: number; y: number; width: number; height: number } {
    let bbox = axis.computeBBox();

    const { x, y, width, height } = bbox;
    return { x, y, width, height };
}

describe('Axis Examples', () => {
    let ctx = setupMockCanvas();

    beforeEach(() => {
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        expect(console.warn).not.toBeCalled();
        expect(console.error).not.toBeCalled();
    });

    for (const [exampleName, example] of Object.entries(EXAMPLES)) {
        it(`for ${exampleName} it should create chart instance as expected`, async () => {
            const options: AgChartOptions = example.options;
            const chart = AgChartV2.create<any>(options);
            await waitForChartStability(chart);
            await example.assertions(chart);
        });

        it(`for ${exampleName} it should render to canvas as expected`, async () => {
            const compare = async () => {
                await waitForChartStability(chart);

                for (const axis of chart.axes) {
                    const axesBBox = calculateAxisBBox(axis);
                    const imageData = extractImageData({ ...ctx, bbox: axesBBox });

                    (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
                }
            };

            const options: AgChartOptions = { ...example.options };
            options.autoSize = false;
            options.width = CANVAS_WIDTH;
            options.height = CANVAS_HEIGHT;

            const chart = AgChartV2.create<any>(options) as Chart;
            await compare();

            if (example.extraScreenshotActions) {
                await example.extraScreenshotActions(chart);
                await compare();
            }
        });
    }

    describe('no series cases', () => {
        beforeEach(() => {
            // Increase timeout for legend toggle case.
            jest.setTimeout(10_000);
        });

        for (const [exampleName, example] of Object.entries(EXAMPLES_NO_SERIES)) {
            it(`for ${exampleName} it should create chart instance as expected`, async () => {
                const options: AgChartOptions = example.options;
                const chart = AgChartV2.create<any>(options);
                await waitForChartStability(chart);
                await example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const compare = async () => {
                    await waitForChartStability(chart);

                    const newImageData = extractImageData({ ...ctx });
                    (expect(newImageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
                };

                const options: AgChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                const chart = AgChartV2.create<any>(options) as Chart;
                await compare();

                if (example.extraScreenshotActions) {
                    await example.extraScreenshotActions(chart);
                    await compare();
                }
            });

            it(`for ${exampleName} it should render identically after legend toggle`, async () => {
                const snapshot = async () => {
                    await waitForChartStability(chart);

                    return ctx.nodeCanvas?.toBuffer('raw');
                };

                const options: AgChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                const chart = AgChartV2.create<any>(options) as Chart;
                const reference = await snapshot();

                chart.series.forEach((s) => {
                    s.toggleSeriesItem(s.getKeys(ChartAxisDirection.Y)[0], true);
                });
                chart.update(ChartUpdateType.FULL);

                const afterUpdate = await snapshot();
                (expect(afterUpdate) as any).not.toMatchImage(reference);

                chart.series.forEach((s) => {
                    s.toggleSeriesItem(s.getKeys(ChartAxisDirection.Y)[0], false);
                });
                chart.update(ChartUpdateType.FULL);

                const afterFinalUpdate = await snapshot();
                (expect(afterFinalUpdate) as any).toMatchImage(reference);
            });
        }
    });
});
