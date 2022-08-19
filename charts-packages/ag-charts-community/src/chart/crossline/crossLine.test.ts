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
import { AgCartesianChartOptions } from '../agChartOptions';
import { AgChartV2 } from '../agChartV2';
import { CartesianChart } from '../cartesianChart';
import * as examples from './test/examples';

expect.extend({ toMatchImageSnapshot });

const CROSSLINES_RANGE_EXAMPLES: Record<string, CartesianTestCase> = {
    VERTICAL_VALID_RANGE_CROSSLINES: {
        options: examples.VERTICAL_VALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_FLIPPED_VALID_RANGE_CROSSLINES: {
        options: examples.VERTICAL_FLIPPED_VALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES: {
        options: examples.VERTICAL_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES: {
        options: examples.VERTICAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES: {
        options: examples.VERTICAL_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES: {
        options: examples.VERTICAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES: {
        options: examples.VERTICAL_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES: {
        options: examples.VERTICAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_RANGE_OUTSIDE_DOMAIN_CROSSLINES: {
        options: examples.VERTICAL_RANGE_OUTSIDE_DOMAIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    VERTICAL_FLIPPED_INVALID_RANGE_CROSSLINES: {
        options: examples.VERTICAL_FLIPPED_INVALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_VALID_RANGE_CROSSLINES: {
        options: examples.HORIZONTAL_VALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_FLIPPED_VALID_RANGE_CROSSLINES: {
        options: examples.HORIZONTAL_FLIPPED_VALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES: {
        options: examples.HORIZONTAL_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES: {
        options: examples.HORIZONTAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES: {
        options: examples.HORIZONTAL_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES: {
        options: examples.HORIZONTAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES: {
        options: examples.HORIZONTAL_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES: {
        options: examples.HORIZONTAL_FLIPPED_RANGE_OUTSIDE_DOMAIN_MIN_MAX_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_RANGE_OUTSIDE_DOMAIN_CROSSLINES: {
        options: examples.HORIZONTAL_RANGE_OUTSIDE_DOMAIN_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_INVALID_RANGE_CROSSLINES: {
        options: examples.HORIZONTAL_INVALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
    HORIZONTAL_FLIPPED_INVALID_RANGE_CROSSLINES: {
        options: examples.HORIZONTAL_FLIPPED_INVALID_RANGE_CROSSLINES,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 2) }),
    },
};

const EXAMPLES: Record<string, CartesianTestCase> = {
    ...CROSSLINES_RANGE_EXAMPLES,
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
};

describe('crossLines', () => {
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

                const chart = AgChartV2.create<CartesianChart>(options);
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

                const chart = AgChartV2.create<CartesianChart>(options);
                await compare();
            });
        }
    });
});
