import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgPolarChartOptions } from '../../agChartOptions';
import { AgChartV2 } from '../../agChartV2';
import { Chart } from '../../chart';
import { PolarChart } from '../../polarChart';
import * as examples from './test/examples';
import {
    waitForChartStability,
    polarChartAssertions,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PolarTestCase,
    repeat,
} from '../../test/utils';

expect.extend({ toMatchImageSnapshot });

const EXAMPLES: Record<string, PolarTestCase> = {
    PIE_SERIES: {
        options: examples.PIE_SERIES,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    PIE_SLICES_DIFFERENT_RADII: {
        options: examples.PIE_SLICES_DIFFERENT_RADII,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    PIE_SLICES_DIFFERENT_RADII_SMALL_RADIUS_MIN: {
        options: examples.PIE_SLICES_DIFFERENT_RADII_SMALL_RADIUS_MIN,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    PIE_SLICES_DIFFERENT_RADII_LARGE_RADIUS_MIN: {
        options: examples.PIE_SLICES_DIFFERENT_RADII_LARGE_RADIUS_MIN,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    PIE_SLICES_DIFFERENT_RADII_SMALL_RADIUS_MAX: {
        options: examples.PIE_SLICES_DIFFERENT_RADII_SMALL_RADIUS_MAX,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    PIE_SLICES_DIFFERENT_RADII_LARGE_RADIUS_MAX: {
        options: examples.PIE_SLICES_DIFFERENT_RADII_LARGE_RADIUS_MAX,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    PIE_SLICES_LABELS: {
        options: examples.PIE_SLICES_LABELS,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    DOUGHNUT_SERIES: {
        options: examples.DOUGHNUT_SERIES,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    DOUGHNUT_SERIES_INNER_TEXT: {
        options: examples.DOUGHNUT_SERIES_INNER_TEXT,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    DOUGHNUT_SERIES_RATIO: {
        options: examples.DOUGHNUT_SERIES_RATIO,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    DOUGHNUT_SERIES_DIFFERENT_RADII: {
        options: examples.DOUGHNUT_SERIES_DIFFERENT_RADII,
        assertions: polarChartAssertions({ seriesTypes: ['pie'] }),
    },
    GROUPED_DOUGHNUT_SERIES: {
        options: examples.GROUPED_DOUGHNUT_SERIES,
        assertions: polarChartAssertions({ seriesTypes: repeat('pie', 2) }),
    },
    GROUPED_DOUGHNUT_SERIES_DIFFERENT_RADII: {
        options: examples.GROUPED_DOUGHNUT_SERIES_DIFFERENT_RADII,
        assertions: polarChartAssertions({ seriesTypes: repeat('pie', 2) }),
    },
};

describe('PolarSeries', () => {
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
                const options: AgPolarChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChartV2.create<PolarChart>(options);
                await waitForChartStability(chart);
                await example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const compare = async () => {
                    await waitForChartStability(chart);

                    const imageData = extractImageData(ctx);
                    (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
                };

                const options: AgPolarChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChartV2.create<PolarChart>(options) as Chart;
                await compare();

                if (example.extraScreenshotActions) {
                    await example.extraScreenshotActions(chart);
                    await compare();
                }
            });
        }
    });
});
