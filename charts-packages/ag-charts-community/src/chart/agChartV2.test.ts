import { describe, expect, it, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgChartOptions } from './agChartOptions';
import { AgChartV2 } from './agChartV2';
import { CartesianChart } from './cartesianChart';
import { Chart } from './chart';
import * as examples from './test/examples';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';

expect.extend({ toMatchImageSnapshot });

function cartesianChartAssertions(params?: { type?: string; axisTypes?: string[]; seriesTypes?: string[] }) {
    const { axisTypes = ['category', 'number'], seriesTypes = ['bar'] } = params || {};

    return (chart: Chart) => {
        expect(chart).toBeInstanceOf(CartesianChart);
        expect(chart.axes).toHaveLength(axisTypes.length);
        expect(chart.axes.map((a) => a.type)).toEqual(axisTypes);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    };
}

function polarChartAssertions(params?: { seriesTypes?: string[] }) {
    const { seriesTypes = ['pie'] } = params || {};

    return (chart: Chart) => {
        expect(chart).toBeInstanceOf(PolarChart);
        expect(chart.axes).toHaveLength(0);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    };
}

function hierarchyChartAssertions(params?: { seriesTypes?: string[] }) {
    const { seriesTypes = ['treemap'] } = params || {};

    return (chart: Chart) => {
        expect(chart).toBeInstanceOf(HierarchyChart);
        expect(chart.axes).toHaveLength(0);
        expect(chart.series.map((s) => s.type)).toEqual(seriesTypes);
    };
}

function repeat<T>(value: T, count: number): T[] {
    const result = new Array(count);
    for (let idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}

async function waitForChartStability(chart: Chart, timeoutMs = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        let retryMs = 10;
        let startMs = Date.now();
        const cb = () => {
            if (!chart.layoutPending && !chart.dataPending && !chart.scene.dirty) {
                resolve();
            }

            const timeMs = Date.now() - startMs;
            if (timeMs >= timeoutMs) {
                reject('timeout reached');
            }

            retryMs *= 2;
            setTimeout(cb, retryMs);
        };

        cb();
    });
}

function mouseMoveEvent({ offsetX, offsetY }: { offsetX: number, offsetY: number}): MouseEvent {
    const event = new MouseEvent('mousemove');
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}

type TestCase = {
    options: AgChartOptions;
    assertions: (chart: Chart) => void;
    extraScreenshotActions?: (chart: Chart) => Promise<void>;
};
const EXAMPLES: Record<string, TestCase> = {
    BAR_CHART_EXAMPLE: {
        options: examples.BAR_CHART_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    GROUPED_BAR_CHART_EXAMPLE: {
        options: examples.GROUPED_BAR_CHART_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    STACKED_BAR_CHART_EXAMPLE: {
        options: examples.STACKED_BAR_CHART_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    ONE_HUNDRED_PERCENT_STACKED_BAR_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_BAR_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    BAR_CHART_WITH_LABELS_EXAMPLE: {
        options: examples.BAR_CHART_WITH_LABELS_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    SIMPLE_COLUMN_CHART_EXAMPLE: {
        options: examples.SIMPLE_COLUMN_CHART_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    GROUPED_COLUMN_EXAMPLE: {
        options: examples.GROUPED_COLUMN_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    STACKED_COLUMN_GRAPH_EXAMPLE: {
        options: examples.STACKED_COLUMN_GRAPH_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    COLUMN_CHART_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.COLUMN_CHART_WITH_NEGATIVE_VALUES_EXAMPLE,
        assertions: cartesianChartAssertions(),
    },
    SIMPLE_PIE_CHART_EXAMPLE: {
        options: examples.SIMPLE_PIE_CHART_EXAMPLE,
        assertions: polarChartAssertions(),
    },
    SIMPLE_DOUGHNUT_CHART_EXAMPLE: {
        options: examples.SIMPLE_DOUGHNUT_CHART_EXAMPLE,
        assertions: polarChartAssertions(),
    },
    SIMPLE_LINE_CHART_EXAMPLE: {
        options: examples.SIMPLE_LINE_CHART_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['line', 'line'] }),
    },
    LINE_GRAPH_WITH_GAPS_EXAMPLE: {
        options: examples.LINE_GRAPH_WITH_GAPS_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: repeat('line', 16) }),
    },
    SIMPLE_SCATTER_CHART_EXAMPLE: {
        options: examples.SIMPLE_SCATTER_CHART_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    BUBBLE_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.BUBBLE_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    },
    BUBBLE_GRAPH_WITH_CATEGORIES_EXAMPLE: {
        options: examples.BUBBLE_GRAPH_WITH_CATEGORIES_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['category', 'category'], seriesTypes: ['scatter'] }),
    },
    SIMPLE_AREA_GRAPH_EXAMPLE: {
        options: examples.SIMPLE_AREA_GRAPH_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('area', 4) }),
    },
    STACKED_AREA_GRAPH_EXAMPLE: {
        options: examples.STACKED_AREA_GRAPH_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: ['area'] }),
    },
    ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: ['area'] }),
    },
    AREA_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.AREA_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: repeat('area', 5) }),
    },
    MARKET_INDEX_TREEMAP_GRAPH_EXAMPLE: {
        options: examples.MARKET_INDEX_TREEMAP_GRAPH_EXAMPLE,
        assertions: hierarchyChartAssertions(),
    },
    SIMPLE_HISTOGRAM_CHART_EXAMPLE: {
        options: examples.SIMPLE_HISTOGRAM_CHART_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['histogram'] }),
    },
    HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE: {
        options: examples.HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['histogram'] }),
    },
    XY_HISTOGRAM_WITH_MEAN_EXAMPLE: {
        options: examples.HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['histogram'] }),
    },
    // START ADVANCED EXAMPLES =====================================================================
    ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS: {
        options: examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 4) }),
    },
    LOG_AXIS_EXAMPLE: {
        options: examples.LOG_AXIS_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['log', 'number'], seriesTypes: ['line'] }),
    },
    ADV_COMBINATION_SERIES_CHART_EXAMPLE: {
        options: examples.ADV_COMBINATION_SERIES_CHART_EXAMPLE,
        assertions: cartesianChartAssertions({
            axisTypes: ['category', 'number', 'number'],
            seriesTypes: ['bar', 'line'],
        }),
    },
    ADV_CHART_CUSTOMISATION: {
        options: examples.ADV_CHART_CUSTOMISATION,
        assertions: cartesianChartAssertions({ axisTypes: ['time', 'number'], seriesTypes: repeat('line', 3) }),
    },
    ADV_CUSTOM_MARKER_SHAPES_EXAMPLE: {
        options: examples.ADV_CUSTOM_MARKER_SHAPES_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: repeat('line', 7) }),
    },
    ADV_CUSTOM_TOOLTIPS_EXAMPLE: {
        options: examples.ADV_CUSTOM_TOOLTIPS_EXAMPLE,
        assertions: cartesianChartAssertions(),
        extraScreenshotActions: async (chart) => {
            // Reveal tooltip.
            chart.scene.canvas.element.dispatchEvent(mouseMoveEvent({ offsetX: 200, offsetY: 300}));
            chart.scene.canvas.element.dispatchEvent(mouseMoveEvent({ offsetX: 201, offsetY: 301}));

            return new Promise((resolve) => { setTimeout(resolve, 50) });
        },
    },
    ADV_PER_MARKER_CUSTOMISATION: {
        options: examples.ADV_PER_MARKER_CUSTOMISATION,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['scatter'] }),
    }
};

describe('AgChartV2', () => {
    describe('#create', () => {
        for (const [exampleName, example] of Object.entries(EXAMPLES)) {
            it(`for ${exampleName} it should prepare options as expected`, async () => {
                const options: AgChartOptions = example.options;
                options.container = document.createElement('div');

                const chart = AgChartV2.create<any>(options);

                expect(chart.options).toHaveProperty('container', options.container);

                if (options.data) {
                    expect(chart.options).toHaveProperty('data', options.data);
                    expect(chart.options).toMatchSnapshot({
                        container: expect.any(HTMLElement),
                        data: expect.any(options.data instanceof Array ? Array : Object),
                    });
                } else {
                    const optionsCopy = { ...chart.options };
                    optionsCopy.series = optionsCopy.series.map((v) => {
                        const copy = { ...v };
                        delete copy.data;
                        return copy;
                    });
                    expect(optionsCopy).toMatchSnapshot({
                        container: expect.any(HTMLElement),
                    });
                }
            });

            it(`for ${exampleName} it should create chart instance as expected`, async () => {
                const options: AgChartOptions = example.options;
                const chart = AgChartV2.create<any>(options);
                example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const compare = async () => {
                    await waitForChartStability(chart);

                    const canvas = chart.scene.canvas;
                    const imageDataUrl = canvas.getDataURL('image/png');
                    const imageData = Buffer.from(imageDataUrl.split(',')[1], 'base64');
    
                    (expect(imageData) as any).toMatchImageSnapshot();
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
});
