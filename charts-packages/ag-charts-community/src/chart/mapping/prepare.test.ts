import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { AgCartesianChartOptions, AgChartOptions } from '../agChartOptions';
import * as examples from '../test/examples';
import { prepareOptions } from './prepare';

type TestCase = {
    options: AgChartOptions;
};
const EXAMPLES: Record<string, TestCase> = {
    BAR_CHART_EXAMPLE: {
        options: examples.BAR_CHART_EXAMPLE,
    },
    GROUPED_BAR_CHART_EXAMPLE: {
        options: examples.GROUPED_BAR_CHART_EXAMPLE,
    },
    STACKED_BAR_CHART_EXAMPLE: {
        options: examples.STACKED_BAR_CHART_EXAMPLE,
    },
    ONE_HUNDRED_PERCENT_STACKED_BAR_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_BAR_EXAMPLE,
    },
    BAR_CHART_WITH_LABELS_EXAMPLE: {
        options: examples.BAR_CHART_WITH_LABELS_EXAMPLE,
    },
    SIMPLE_COLUMN_CHART_EXAMPLE: {
        options: examples.SIMPLE_COLUMN_CHART_EXAMPLE,
    },
    GROUPED_COLUMN_EXAMPLE: {
        options: examples.GROUPED_COLUMN_EXAMPLE,
    },
    STACKED_COLUMN_GRAPH_EXAMPLE: {
        options: examples.STACKED_COLUMN_GRAPH_EXAMPLE,
    },
    ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE,
    },
    COLUMN_CHART_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.COLUMN_CHART_WITH_NEGATIVE_VALUES_EXAMPLE,
    },
    SIMPLE_PIE_CHART_EXAMPLE: {
        options: examples.SIMPLE_PIE_CHART_EXAMPLE,
    },
    SIMPLE_DOUGHNUT_CHART_EXAMPLE: {
        options: examples.SIMPLE_DOUGHNUT_CHART_EXAMPLE,
    },
    SIMPLE_LINE_CHART_EXAMPLE: {
        options: examples.SIMPLE_LINE_CHART_EXAMPLE,
    },
    LINE_GRAPH_WITH_GAPS_EXAMPLE: {
        options: examples.LINE_GRAPH_WITH_GAPS_EXAMPLE,
    },
    SIMPLE_SCATTER_CHART_EXAMPLE: {
        options: examples.SIMPLE_SCATTER_CHART_EXAMPLE,
    },
    BUBBLE_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.BUBBLE_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE,
    },
    BUBBLE_GRAPH_WITH_CATEGORIES_EXAMPLE: {
        options: examples.BUBBLE_GRAPH_WITH_CATEGORIES_EXAMPLE,
    },
    SIMPLE_AREA_GRAPH_EXAMPLE: {
        options: examples.SIMPLE_AREA_GRAPH_EXAMPLE,
    },
    STACKED_AREA_GRAPH_EXAMPLE: {
        options: examples.STACKED_AREA_GRAPH_EXAMPLE,
    },
    ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE,
    },
    AREA_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.AREA_GRAPH_WITH_NEGATIVE_VALUES_EXAMPLE,
    },
    MARKET_INDEX_TREEMAP_GRAPH_EXAMPLE: {
        options: examples.MARKET_INDEX_TREEMAP_GRAPH_EXAMPLE,
    },
    SIMPLE_HISTOGRAM_CHART_EXAMPLE: {
        options: examples.SIMPLE_HISTOGRAM_CHART_EXAMPLE,
    },
    HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE: {
        options: examples.HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE,
    },
    XY_HISTOGRAM_WITH_MEAN_EXAMPLE: {
        options: examples.HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE,
    },
    // START ADVANCED EXAMPLES =====================================================================
    ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS: {
        options: examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS,
    },
    LOG_AXIS_EXAMPLE: {
        options: examples.LOG_AXIS_EXAMPLE,
    },
    ADV_COMBINATION_SERIES_CHART_EXAMPLE: {
        options: examples.ADV_COMBINATION_SERIES_CHART_EXAMPLE,
    },
    ADV_CHART_CUSTOMISATION: {
        options: examples.ADV_CHART_CUSTOMISATION,
    },
    ADV_CUSTOM_MARKER_SHAPES_EXAMPLE: {
        options: examples.ADV_CUSTOM_MARKER_SHAPES_EXAMPLE,
    },
    ADV_CUSTOM_TOOLTIPS_EXAMPLE: {
        options: examples.ADV_CUSTOM_TOOLTIPS_EXAMPLE,
    },
    ADV_PER_MARKER_CUSTOMISATION_EXAMPLE: {
        options: examples.ADV_PER_MARKER_CUSTOMISATION,
    },
};

const COMBO_CHART_EXAMPLE: AgCartesianChartOptions = {
    series: [
        { type: 'line', yKey: 'test2' },
        { type: 'column', yKey: 'test' },
        { type: 'area', yKey: 'test3' },
    ],
    theme: {
        baseTheme: {
            baseTheme: 'ag-default',
            overrides: {
                column: { series: { label: { enabled: true } } },
                line: { series: { label: { enabled: true } } },
                area: { series: { label: { enabled: true } } },
            },
        } as any,
        overrides: {},
    },
};

describe('prepare', () => {
    describe('#prepareOptions', () => {
        beforeEach(() => {
            console.warn = jest.fn();
        });

        afterEach(() => {
            expect(console.warn).not.toBeCalled();
        });

        for (const [exampleName, example] of Object.entries(EXAMPLES)) {
            it(`for ${exampleName} it should prepare options as expected`, async () => {
                const options: AgChartOptions = example.options;
                options.container = document.createElement('div');

                const preparedOptions = prepareOptions(options);

                if (options.data) {
                    expect(preparedOptions).toHaveProperty('data', options.data);
                    expect(preparedOptions).toMatchSnapshot({
                        container: expect.any(HTMLElement),
                        data: expect.any(options.data instanceof Array ? Array : Object),
                    });
                } else {
                    const optionsCopy = { ...preparedOptions };
                    optionsCopy.series = (optionsCopy.series as any[]).map((v) => {
                        const copy = { ...v };
                        delete copy.data;
                        return copy;
                    });
                    expect(optionsCopy).toMatchSnapshot({
                        container: expect.any(HTMLElement),
                    });
                }
            });
        }

        it('should merge combo-chart series overrides as expected', () => {
            const options = COMBO_CHART_EXAMPLE;
            options.container = document.createElement('div');

            const preparedOptions = prepareOptions(options);

            expect(preparedOptions.series?.length).toEqual(3);
            expect(preparedOptions.series?.map((s) => s.type)).toEqual(['line', 'column', 'area']);
            expect(preparedOptions.series?.map((s) => s.label?.enabled)).toEqual([true, true, true]);
        });
    });
});
