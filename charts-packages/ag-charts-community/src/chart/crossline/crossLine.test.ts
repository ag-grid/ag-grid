import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    cartesianChartAssertions,
    CartesianTestCase,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    repeat,
    setupMockCanvas,
    waitForChartStability,
} from '../test/utils';
import { AgCartesianChartOptions, AgCrossLineOptions, AgCrossLineLabelPosition } from '../agChartOptions';
import { AgChartV2 } from '../agChartV2';
import { CartesianChart } from '../cartesianChart';
import * as examples from './test/examples';
import { Chart } from '../chart';

expect.extend({ toMatchImageSnapshot });

const labelPositions: AgCrossLineLabelPosition[] = [
    'top',
    'left',
    'right',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'inside',
    'insideLeft',
    'insideRight',
    'insideTop',
    'insideBottom',
    'insideTopLeft',
    'insideBottomLeft',
    'insideTopRight',
    'insideBottomRight',
];

const flipCrossLinesRange = (crossLineOptions: AgCrossLineOptions): AgCrossLineOptions => {
    const flippedRange: [any, any] = [crossLineOptions.range[1], crossLineOptions.range[0]];
    return {
        ...crossLineOptions,
        range: flippedRange,
    };
};

const applyCrossLinesLabelPosition = (
    crossLineOptions: AgCrossLineOptions,
    position: AgCrossLineLabelPosition
): AgCrossLineOptions => {
    return {
        ...crossLineOptions,
        label: {
            ...crossLineOptions.label,
            position,
        },
    };
};

const mixinFlippedRangeCases = (
    baseRangeCases: Record<string, CartesianTestCase>
): Record<string, CartesianTestCase> => {
    const result: Record<string, CartesianTestCase> = { ...baseRangeCases };

    const examplesToFlip = Object.entries(baseRangeCases).slice(0, -2);

    examplesToFlip.forEach(([name, example]) => {
        const prefix = name.substring(0, name.indexOf('_'));
        const suffix = name.substring(name.indexOf('_'));
        result[`${prefix}_FLIPPED${suffix}`] = {
            ...example,
            options: {
                ...example.options,
                axes: example.options.axes.map((axis) =>
                    axis.crossLines ? { ...axis, crossLines: axis.crossLines.map((c) => flipCrossLinesRange(c)) } : axis
                ),
            },
        };
    });

    return result;
};

const mixinLabelPositionCases = (example: CartesianTestCase): Record<string, CartesianTestCase> => {
    const result: Record<string, CartesianTestCase> = { DEFAULT_LABEL_POSITION_CROSSLINES: { ...example } };

    for (const position of labelPositions) {
        result[`${position}_LABEL_POSITION_CROSSLINES`] = {
            ...example,
            options: {
                ...example.options,
                axes: example.options.axes.map((axis) =>
                    axis.crossLines
                        ? {
                              ...axis,
                              crossLines: axis.crossLines.map((c) => applyCrossLinesLabelPosition(c, position)),
                          }
                        : axis
                ),
            },
        };
    }

    return result;
};

const CROSSLINES_LABEL_POSITON_EXAMPLES: Record<string, CartesianTestCase> = mixinLabelPositionCases({
    options: examples.DEFAULT_LABEL_POSITION_CROSSLINES,
    assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
});

const CROSSLINES_RANGE_EXAMPLES: Record<string, CartesianTestCase> = mixinFlippedRangeCases({
    VALID_RANGE_CROSSLINES: {
        options: examples.VALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    INVALID_RANGE_CROSSLINES: {
        options: examples.INVALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES: {
        options: examples.RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES: {
        options: examples.RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES: {
        options: examples.RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    RANGE_OUTSIDE_DOMAIN_CROSSLINES: {
        options: examples.RANGE_OUTSIDE_DOMAIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
});

const NAVIGATOR_ZOOM_EXAMPLES: Record<string, CartesianTestCase> = {
    NAV_ZOOMED_CROSSLINES: {
        options: {
            ...examples.VALID_RANGE_CROSSLINES,
            navigator: { min: 0.4, max: 0.6 },
        },
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    NAV_ZOOMED_NO_CROSSLINES: {
        options: {
            ...examples.VALID_RANGE_CROSSLINES,
            navigator: { min: 0.0, max: 0.05 },
        },
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    NAV_ZOOMED_NO_CROSSLINES_2: {
        options: {
            ...examples.VALID_RANGE_CROSSLINES,
            navigator: { min: 0.95, max: 1.0 },
        },
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    NAV_ZOOMED_CLIPPED_CROSSLINES_1: {
        options: {
            ...examples.VALID_RANGE_CROSSLINES,
            navigator: { min: 0.0, max: 0.5 },
        },
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    NAV_ZOOMED_CLIPPED_CROSSLINES_2: {
        options: {
            ...examples.VALID_RANGE_CROSSLINES,
            navigator: { min: 0.5, max: 1.0 },
        },
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
};

const EXAMPLES: Record<string, CartesianTestCase> = {
    ...CROSSLINES_RANGE_EXAMPLES,
    ...CROSSLINES_LABEL_POSITON_EXAMPLES,
    SCATTER_CROSSLINES: {
        options: examples.SCATTER_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    LINE_CROSSLINES: {
        options: examples.LINE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: repeat('line', 16) }),
    },
    AREA_CROSSLINES: {
        options: examples.AREA_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: repeat('area', 5) }),
    },
    COLUMN_CROSSLINES: {
        options: examples.COLUMN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: ['bar'] }),
    },
    BAR_CROSSLINES: {
        options: examples.BAR_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'number'], seriesTypes: ['bar'] }),
    },
    HISTOGRAM_CROSSLINES: {
        options: examples.HISTOGRAM_CROSSLINES,
        assertions: cartesianChartAssertions({
            axisTypes: ['number', 'number'],
            seriesTypes: ['histogram', 'scatter'],
        }),
    },
    ...NAVIGATOR_ZOOM_EXAMPLES,
};

describe('crossLines', () => {
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
                const options: AgCartesianChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChartV2.create<CartesianChart>(options);
                await waitForChartStability(chart);
                await example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const compare = async () => {
                    await waitForChartStability(chart);

                    const imageData = extractImageData(ctx);
                    (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
                };

                const options: AgCartesianChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChartV2.create<CartesianChart>(options);
                await compare();
            });
        }
    });
});
