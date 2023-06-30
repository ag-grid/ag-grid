import type { AgChartOptions } from '../agChartOptions';
import type { Chart } from '../chart';
import * as examples from './examples';
import { cartesianChartAssertions, hierarchyChartAssertions, polarChartAssertions, repeat } from './utils';

type TestCase = {
    options: AgChartOptions;
    assertions: (chart: Chart) => Promise<void>;
    extraScreenshotActions?: (chart: Chart) => Promise<void>;
};
export const EXAMPLES: Record<string, TestCase> = {
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
        assertions: cartesianChartAssertions({ seriesTypes: ['column'] }),
    },
    GROUPED_COLUMN_EXAMPLE: {
        options: examples.GROUPED_COLUMN_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: ['column'] }),
    },
    STACKED_COLUMN_GRAPH_EXAMPLE: {
        options: examples.STACKED_COLUMN_GRAPH_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: ['column'] }),
    },
    ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE: {
        options: examples.ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: ['column'] }),
    },
    COLUMN_CHART_WITH_NEGATIVE_VALUES_EXAMPLE: {
        options: examples.COLUMN_CHART_WITH_NEGATIVE_VALUES_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: ['column'] }),
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
    GROUPED_CATEGORY_AXIS_EXAMPLE: {
        options: examples.GROUPED_CATEGORY_AXIS_EXAMPLE,
        assertions: cartesianChartAssertions({ axisTypes: ['groupedCategory', 'number'], seriesTypes: ['column'] }),
    },
    CROSS_LINES_EXAMPLE: {
        options: examples.CROSS_LINES_EXAMPLE,
        assertions: cartesianChartAssertions({ seriesTypes: ['column'] }),
    },
    ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS: {
        options: examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS,
        assertions: cartesianChartAssertions({
            axisTypes: ['time', 'number'],
            seriesTypes: ['line', 'line', 'line', 'line'],
        }),
    },
};
