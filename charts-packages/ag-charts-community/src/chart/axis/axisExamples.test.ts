import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { AgChartOptions } from '../agChartOptions';
import { AgChartV2 } from '../agChartV2';
import { Chart } from '../chart';
import { ChartAxis } from '../chartAxis';
import * as examples from '../test/examples-axes';
import {
    waitForChartStability,
    cartesianChartAssertions,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    toMatchImage,
} from '../test/utils';

expect.extend({ toMatchImageSnapshot, toMatchImage });

function applyRotation<T>(opts: T, rotation: number): T {
    return {
        ...opts,
        axes: opts['axes']?.map(axis => ({ ...axis, label: { ...axis.label, rotation} })) || undefined,
    };
}

type TestCase = {
    options: AgChartOptions;
    assertions: (chart: Chart) => Promise<void>;
    extraScreenshotActions?: (chart: Chart) => Promise<void>;
};
const EXAMPLES: Record<string, TestCase> = {
    BASIC_CATEGORY_AXIS: {
        options: examples.CATEGORY_AXIS_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    BASIC_CATEGORY_AXIS_MANUAL_ROTATION: {
        options: applyRotation(examples.CATEGORY_AXIS_BASIC_EXAMPLE, -30),
        assertions: cartesianChartAssertions(),
    },
    BASIC_CATEGORY_UNIFORM_AXIS: {
        options: examples.CATEGORY_AXIS_UNIFORM_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    BASIC_CATEGORY_UNIFORM_AXIS_MANUAL_ROTATION: {
        options: applyRotation(examples.CATEGORY_AXIS_UNIFORM_BASIC_EXAMPLE, -30),
        assertions: cartesianChartAssertions(),
    },
    GROUPED_CATEGORY_AXIS: {
        options: examples.GROUPED_CATEGORY_AXIS_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['groupedCategory', 'number'] }),
    },
    GROUPED_CATEGORY_AXIS_MANUAL_ROTATION: {
        options: applyRotation(examples.GROUPED_CATEGORY_AXIS_EXAMPLE, -30),
        assertions: cartesianChartAssertions({ axisTypes: ['groupedCategory', 'number'] }),
    },
    BASIC_TIME_AXIS: {
        options: examples.TIME_AXIS_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['line']}),
    },
    BASIC_TIME_AXIS_MANUAL_ROTATION: {
        options: applyRotation(examples.TIME_AXIS_BASIC_EXAMPLE, -30),
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['line']}),
    },
    NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE: {
        options: examples.NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['line']}),
    },
    NUMBER_AXIS_UNIFORM_MANUAL_ROTATION: {
        options: applyRotation(examples.NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE, -30),
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['line']}),
    }
};

function calculateAxisBBox(axis: ChartAxis<any>): { x: number, y: number, width: number, height: number} {
    let bbox = axis.computeBBox();

    let parent: typeof axis.group.parent = axis.group;
    while (parent != null) {
        bbox = parent.matrix.transformBBox(bbox);

        parent = parent.parent;
    }

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
            options.width = 800;
            options.height = 600;

            const chart = AgChartV2.create<any>(options) as Chart;
            await compare();

            if (example.extraScreenshotActions) {
                await example.extraScreenshotActions(chart);
                await compare();
            }
        });
    }
});
