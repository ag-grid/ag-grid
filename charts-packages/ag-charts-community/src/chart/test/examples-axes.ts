import day from '../../util/time/day';
import {
    AgChartOptions,
    AgCartesianChartOptions,
    AgAxisNumberTickOptions,
    AgAxisTimeTickOptions,
    AgAxisCategoryTickOptions,
} from '../agChartOptions';
import { DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY_EXTENDED } from './data';
import * as data from './data-axes';
import * as examples from './examples';

export const CATEGORY_AXIS_BASIC_EXAMPLE: AgChartOptions = {
    type: 'column',
    data: data.DATA_COUNTRY_DIETARY_STATS,
    axes: [
        { type: 'category', position: 'bottom' },
        { type: 'number', position: 'left' },
    ],
    series: [
        {
            xKey: 'country',
            xName: 'Country',
            yKey: 'sugar',
            yName: 'Sugar',
            grouped: true,
            type: 'column',
        },
        {
            xKey: 'country',
            xName: 'Country',
            yKey: 'fat',
            yName: 'Fat',
            grouped: true,
            type: 'column',
        },
        {
            xKey: 'country',
            xName: 'Country',
            yKey: 'weight',
            yName: 'Weight',
            grouped: true,
            type: 'column',
        },
    ],
};

export const CATEGORY_AXIS_UNIFORM_BASIC_EXAMPLE: AgChartOptions = {
    type: 'column',
    data: data.DATA_YOUTUBE_VIDEOS_STATS_BY_DAY_OF_YEAR,
    axes: [
        { type: 'category', position: 'bottom' },
        { type: 'number', position: 'left' },
    ],
    series: [
        {
            xKey: 'day',
            xName: 'Day',
            yKey: 'likes',
            yName: 'Likes',
            type: 'column',
        },
    ],
};

export const TIME_AXIS_BASIC_EXAMPLE: AgChartOptions = {
    data: data.DATA_YOUTUBE_VIDEOS_STATS_BY_DATE,
    axes: [
        { type: 'time', position: 'bottom', tick: { count: day } },
        { type: 'number', position: 'left' },
    ],
    series: [
        {
            xKey: 'date',
            xName: 'Day',
            yKey: 'likes',
            yName: 'Likes',
            type: 'line',
        },
    ],
};

export const TIME_AXIS_MIN_MAX_DATE_EXAMPLE: AgCartesianChartOptions = {
    ...TIME_AXIS_BASIC_EXAMPLE,
    axes: [
        {
            type: 'time',
            position: 'bottom',
            min: new Date(2022, 1, 15, 0, 0, 0),
            max: new Date(2022, 2, 15, 0, 0, 0),
            tick: { count: day },
        },
        { type: 'number', position: 'left' },
    ],
};

export const TIME_AXIS_MIN_MAX_NUMBER_EXAMPLE: AgCartesianChartOptions = {
    ...TIME_AXIS_MIN_MAX_DATE_EXAMPLE,
    axes: [
        {
            type: 'time',
            position: 'bottom',
            min: new Date(2022, 1, 15, 0, 0, 0).getTime(),
            max: new Date(2022, 2, 15, 0, 0, 0).getTime(),
            tick: { count: day },
        },
        { type: 'number', position: 'left' },
    ],
};

export const NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE: AgChartOptions = {
    type: 'line',
    data: data.DATA_YOUTUBE_VIDEOS_STATS_BY_DAY_OF_YEAR,
    axes: [
        { type: 'number', position: 'bottom' },
        { type: 'number', position: 'left' },
    ],
    series: [
        {
            xKey: 'day',
            xName: 'Day',
            yKey: 'likes',
            yName: 'Likes',
            type: 'line',
        },
    ],
};

export const NUMBER_AXIS_LOG10_EXAMPLE: AgCartesianChartOptions = {
    ...NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE,
    data: data.DATA_YOUTUBE_VIDEOS_STATS_BY_DAY_OF_YEAR_LARGE_SCALE,
    axes: [
        { type: 'number', position: 'bottom' },
        { type: 'log', position: 'left', base: 10, label: { format: '.0f' }, tick: { count: 4 } },
    ],
};

export const NUMBER_AXIS_LOG2_EXAMPLE: AgCartesianChartOptions = {
    ...NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE,
    data: data.DATA_YOUTUBE_VIDEOS_STATS_BY_DAY_OF_YEAR_LARGE_SCALE,
    axes: [
        { type: 'number', position: 'bottom' },
        { type: 'log', position: 'left', base: 2, label: { format: '.0f' }, tick: { count: 4 } },
    ],
};

export const GROUPED_CATEGORY_AXIS_EXAMPLE: AgChartOptions = {
    ...examples.GROUPED_CATEGORY_AXIS_EXAMPLE,
    data: DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY_EXTENDED.slice(0, 20),
};

export const NUMBER_AXIS_NO_SERIES: AgChartOptions = {
    ...examples.SIMPLE_SCATTER_CHART_EXAMPLE,
    series: examples.SIMPLE_SCATTER_CHART_EXAMPLE.series?.map((s) => ({ ...s, visible: false })),
    legend: { enabled: false },
};

export const NUMBER_AXIS_TICK_VALUES: AgChartOptions = {
    ...examples.SIMPLE_SCATTER_CHART_EXAMPLE,
    axes: [
        { type: 'number', position: 'bottom', tick: { values: [142, 153, 203, 220, 290] } },
        { type: 'number', position: 'left' },
    ],
};

export const TIME_AXIS_TICK_VALUES: AgChartOptions = {
    ...examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS,
    axes: [
        {
            type: 'time',
            position: 'bottom',
            tick: {
                values: [new Date(2020, 0, 1), new Date(2020, 0, 4), new Date(2020, 0, 17), new Date(2020, 0, 28)],
            } as AgAxisTimeTickOptions,
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
};

export const LOG_AXIS_TICK_VALUES: AgChartOptions = {
    ...NUMBER_AXIS_UNIFORM_BASIC_EXAMPLE,
    axes: [
        { type: 'number', position: 'bottom' },
        {
            type: 'log',
            position: 'left',
            tick: { values: [2, 4, 8, 16, 12, 20, 200, 400, 800] },
        },
    ],
};

export const CATEGORY_AXIS_TICK_VALUES: AgChartOptions = {
    ...examples.GROUPED_COLUMN_EXAMPLE,
    axes: [
        { type: 'category', position: 'bottom', tick: { values: ['2016', '2018'] } as AgAxisCategoryTickOptions },
        { type: 'number', position: 'left' },
    ],
};

export const AXIS_TICK_MIN_SPACING: AgChartOptions = {
    ...examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS,
    axes: [
        {
            type: 'time',
            position: 'bottom',
            tick: { minSpacing: 200 } as AgAxisTimeTickOptions,
        },
        {
            type: 'number',
            position: 'left',
            tick: { minSpacing: 100 } as AgAxisTimeTickOptions,
        },
    ],
};

export const AXIS_TICK_MAX_SPACING: AgChartOptions = {
    ...examples.SIMPLE_SCATTER_CHART_EXAMPLE,
    axes: [
        { type: 'number', position: 'left', tick: { maxSpacing: 30 } },
        { type: 'number', position: 'bottom', tick: { maxSpacing: 30 } },
    ],
};

export const AXIS_TICK_MIN_MAX_SPACING: AgChartOptions = {
    ...examples.GROUPED_COLUMN_EXAMPLE,
    axes: [
        { type: 'category', position: 'bottom', tick: { minSpacing: 150, maxSpacing: 250 } },
        { type: 'number', position: 'left', tick: { minSpacing: 50, maxSpacing: 100 } },
    ],
};

export const NUMBER_AXIS_NO_SERIES_FIXED_DOMAIN: AgChartOptions = {
    ...NUMBER_AXIS_NO_SERIES,
    axes: NUMBER_AXIS_NO_SERIES.axes?.map((a) => {
        if (a.position === 'left' && a.type === 'number') {
            return { ...a, min: 66, max: 84 };
        } else if (a.position === 'bottom' && a.type === 'number') {
            return { ...a, min: 150, max: 290 };
        }
        return a;
    }),
};

export const TIME_AXIS_NO_SERIES: AgChartOptions = {
    ...examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS,
    series: examples.ADV_TIME_AXIS_WITH_IRREGULAR_INTERVALS.series?.map((s) => ({ ...s, visible: false })),
    legend: { enabled: false },
};

export const TIME_AXIS_NO_SERIES_FIXED_DOMAIN: AgChartOptions = {
    ...TIME_AXIS_NO_SERIES,
    axes: TIME_AXIS_NO_SERIES.axes?.map((a) => {
        if (a.position === 'left' && a.type === 'number') {
            return { ...a, min: 2.4, max: 4.7 };
        } else if (a.position === 'bottom' && a.type === 'time') {
            return { ...a, min: new Date('2020-01-01T00:25:35.920Z'), max: new Date('2020-01-31T14:15:33.950Z') };
        }
        return a;
    }),
};

export const COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES: AgChartOptions = {
    ...examples.ADV_COMBINATION_SERIES_CHART_EXAMPLE,
    series: examples.ADV_COMBINATION_SERIES_CHART_EXAMPLE.series?.map((s) => ({ ...s, visible: false })),
    legend: { enabled: false },
};

export const COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES_FIXED_DOMAIN: AgChartOptions = {
    ...COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES,
    axes: COMBO_CATEGORY_NUMBER_AXIS_NO_SERIES.axes?.map((a) => {
        if (a.position === 'left' && a.type === 'number') {
            return { ...a, min: 0, max: 4000 };
        } else if (a.position === 'right' && a.type === 'number') {
            return { ...a, min: 100000, max: 140000 };
        }
        return a;
    }),
};

export const AREA_CHART_NO_SERIES: AgChartOptions = {
    ...examples.STACKED_AREA_GRAPH_EXAMPLE,
    series: examples.STACKED_AREA_GRAPH_EXAMPLE.series?.map((s) => ({ ...s, visible: false })),
};

export const AREA_CHART_STACKED_NORMALISED_NO_SERIES: AgChartOptions = {
    ...examples.ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE,
    series: examples.ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE.series?.map((s) => ({ ...s, visible: false })),
};
