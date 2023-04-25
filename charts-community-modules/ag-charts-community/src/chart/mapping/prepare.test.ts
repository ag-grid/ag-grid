import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { AgCartesianChartOptions, AgChartOptions, AgLineSeriesOptions } from '../agChartOptions';
import * as examples from '../test/examples';
import { ChartTheme } from '../themes/chartTheme';
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

const COMPLEX_THEME_SCENARIO: AgCartesianChartOptions = {
    series: [
        { type: 'line', yKey: 'test2' },
        { type: 'column', yKey: 'test' },
        { type: 'area', yKey: 'test3' },
        { type: 'area', yKey: 'test4', label: {} },
    ],
    axes: [
        { type: 'time', position: 'bottom' },
        { type: 'time', position: 'bottom', title: { text: 'Time' } },
        { type: 'number', position: 'left', title: { text: 'Velocity' } },
        { type: 'number', position: 'right', title: { text: 'G', enabled: true } },
    ],
    theme: {
        baseTheme: {
            baseTheme: 'ag-default',
            overrides: {
                common: {
                    axes: {
                        number: { title: { _enabledFromTheme: true, enabled: false } },
                    },
                },
                column: { series: { label: { enabled: false, _enabledFromTheme: true } } },
                line: { series: { label: { enabled: true, _enabledFromTheme: true } } },
            },
        } as any,
        overrides: {},
    },
};

const ENABLED_FALSE_OPTIONS: AgCartesianChartOptions = {
    ...examples.SIMPLE_LINE_CHART_EXAMPLE,
    title: {
        enabled: false,
        text: 'Custom Title',
        fontSize: 40,
        spacing: 200,
    },
    subtitle: {
        enabled: false,
        text: 'Custom Subtitle',
        fontSize: 20,
        spacing: 100,
    },
    footnote: {
        enabled: false,
        text: 'Custom Footnote',
        fontSize: 30,
        spacing: 150,
    },
    axes: [
        {
            position: 'bottom',
            type: 'time',
            tick: {
                enabled: false,
                width: 66,
                size: 44,
                maxSpacing: 26,
            },
            title: {
                enabled: false,
                text: 'Custom Bottom Axis Title',
            },
            label: {
                enabled: false,
                avoidCollisions: false,
                autoRotate: true,
                minSpacing: 15,
            },
            crossLines: [
                {
                    enabled: false,
                    type: 'range',
                    label: {
                        enabled: false,
                        text: 'Custom Crossline Label',
                    },
                },
            ],
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Custom Left Axis Title',
            },
            label: {
                autoRotate: true,
            },
        },
    ],
    series: [
        {
            ...examples.SIMPLE_LINE_CHART_EXAMPLE.series?.[0],
            marker: {
                enabled: false,
                strokeWidth: 20,
            },
            label: {
                enabled: false,
                color: 'pink',
            },
            tooltip: {
                enabled: false,
                renderer: ({ yValue }) => ({ title: `Custom Series Tooltip Renderer: ${yValue}` }),
            },
        },
    ] as AgLineSeriesOptions[],
    tooltip: {
        enabled: false,
        range: 20,
    },
    legend: {
        enabled: false,
        maxHeight: 100,
        maxWidth: 500,
        orientation: 'horizontal',
        spacing: 55,
        reverseOrder: true,
        pagination: {
            marker: {
                shape: 'circle',
            },
        },
        item: {
            label: {
                maxLength: 33,
            },
        },
    },
    navigator: {
        enabled: false,
        height: 229,
        min: 0.5,
        max: 0.8,
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

        it('should merge complex theme setups as expected', () => {
            const options = COMPLEX_THEME_SCENARIO;

            options.container = document.createElement('div');

            const preparedOptions = prepareOptions(options);

            expect(preparedOptions.axes?.length).toEqual(4);
            expect(preparedOptions.axes?.map((a) => a.type)).toEqual(['time', 'time', 'number', 'number']);
            expect(preparedOptions.axes?.map((a) => a.title?.enabled)).toEqual([false, true, false, true]);
            expect(preparedOptions.series?.length).toEqual(4);
            expect(preparedOptions.series?.map((s) => s.type)).toEqual(['line', 'column', 'area', 'area']);
            expect(preparedOptions.series?.map((s) => s.label?.enabled)).toEqual([true, false, false, true]);
        });

        it('should use default theme options when `enabled` is set to `false` on an options object', () => {
            const options = ENABLED_FALSE_OPTIONS;
            options.container = document.createElement('div');

            const preparedOptions = prepareOptions(options);
            const theme = new ChartTheme();

            console.log(theme.config.cartesian);

            expect(preparedOptions.title!.enabled).toBe(false);
            expect(preparedOptions.title!.text).toBe(theme.config.cartesian.title.text);
            expect(preparedOptions.title!.fontSize).toBe(theme.config.cartesian.title.fontSize);
            expect(preparedOptions.title!.spacing).toBe(theme.config.cartesian.title.spacing);

            expect(preparedOptions.subtitle!.enabled).toBe(false);
            expect(preparedOptions.subtitle!.text).toBe(theme.config.cartesian.subtitle.text);
            expect(preparedOptions.subtitle!.fontSize).toBe(theme.config.cartesian.subtitle.fontSize);
            expect(preparedOptions.subtitle!.spacing).toBe(theme.config.cartesian.subtitle.spacing);

            expect(preparedOptions.footnote!.enabled).toBe(false);
            expect(preparedOptions.footnote!.text).toBe(theme.config.cartesian.footnote.text);
            expect(preparedOptions.footnote!.fontSize).toBe(theme.config.cartesian.footnote.fontSize);
            expect(preparedOptions.footnote!.spacing).toBe(theme.config.cartesian.footnote.spacing);

            expect(preparedOptions.axes![0]!.tick!.enabled).toBe(false);
            expect(preparedOptions.axes![0]!.tick!.width).toBe(theme.config.cartesian.axes.time.tick.width);
            expect(preparedOptions.axes![0]!.tick!.size).toBe(theme.config.cartesian.axes.time.tick.size);
            expect(preparedOptions.axes![0]!.tick!.maxSpacing).toBe(theme.config.cartesian.axes.time.tick.maxSpacing);

            expect(preparedOptions.axes![0]!.title!.enabled).toBe(false);
            expect(preparedOptions.axes![0]!.title!.text).toBe(theme.config.cartesian.axes.time.title.text);

            expect(preparedOptions.axes![0]!.label!.enabled).toBe(false);
            expect(preparedOptions.axes![0]!.label!.avoidCollisions).toBe(
                theme.config.cartesian.axes.time.label.avoidCollisions
            );
            expect(preparedOptions.axes![0]!.label!.autoRotate).toBe(theme.config.cartesian.axes.time.label.autoRotate);
            expect(preparedOptions.axes![0]!.label!.minSpacing).toBe(theme.config.cartesian.axes.time.label.minSpacing);

            expect(preparedOptions.axes![0]!.crossLines![0]!.enabled).toBe(false);
            expect(preparedOptions.axes![0]!.crossLines![0]!.type).toBe(
                theme.config.cartesian.axes.time.crossLines.type
            );
            expect(preparedOptions.axes![0]!.crossLines![0]!.label!.enabled).toBe(false);
            expect(preparedOptions.axes![0]!.crossLines![0]!.label!.text).toBe(
                theme.config.cartesian.axes.time.crossLines.label.text
            );

            expect(preparedOptions.axes![1]!.title!.enabled).toBe(true);
            expect(preparedOptions.axes![1]!.title!.text).toBe('Custom Left Axis Title');

            expect((preparedOptions.series![0]! as AgLineSeriesOptions).marker!.enabled).toBe(false);
            expect((preparedOptions.series![0]! as AgLineSeriesOptions).marker!.strokeWidth).toBe(
                theme.config.cartesian.series.line.marker.strokeWidth
            );
            expect(preparedOptions.series![0]!.label!.enabled).toBe(false);
            expect(preparedOptions.series![0]!.label!.color).toBe(theme.config.cartesian.series.line.label.color);
            expect(preparedOptions.series![0]!.tooltip!.enabled).toBe(false);
            expect(preparedOptions.series![0]!.tooltip!.renderer).toBe(
                theme.config.cartesian.series.line.tooltip.renderer
            );

            expect(preparedOptions.tooltip!.enabled).toBe(false);
            expect(preparedOptions.tooltip!.range).toBe(theme.config.cartesian.tooltip.range);

            expect(preparedOptions.legend!.enabled).toBe(false);
            expect(preparedOptions.legend!.maxHeight).toBe(theme.config.cartesian.legend.maxHeight);
            expect(preparedOptions.legend!.maxWidth).toBe(theme.config.cartesian.legend.maxWidth);
            expect(preparedOptions.legend!.orientation).toBe(theme.config.cartesian.legend.orientation);
            expect(preparedOptions.legend!.spacing).toBe(theme.config.cartesian.legend.spacing);
            expect(preparedOptions.legend!.reverseOrder).toBe(theme.config.cartesian.legend.reverseOrder);
            expect(preparedOptions.legend!.pagination!.marker!.shape).toBe(
                theme.config.cartesian.legend.pagination.marker.shape
            );
            expect(preparedOptions.legend!.item!.label!.maxLength).toBe(
                theme.config.cartesian.legend.item.label.maxLength
            );

            expect(preparedOptions.navigator!.enabled).toBe(false);
            expect(preparedOptions.navigator!.height).toBe(theme.config.cartesian.navigator.height);
            expect(preparedOptions.navigator!.min).toBe(theme.config.cartesian.navigator.min);
            expect(preparedOptions.navigator!.max).toBe(theme.config.cartesian.navigator.max);
        });
    });
});
