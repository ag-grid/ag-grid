import day from '../../util/time/day';
import { AgChartOptions } from '../agChartOptions';
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
            yKeys: ['sugar', 'fat', 'weight'],
            yNames: ['Sugar', 'Fat', 'Weight'],
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
            yKeys: ['likes'],
            yNames: ['Likes'],
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

export const GROUPED_CATEGORY_AXIS_EXAMPLE: AgChartOptions = {
    ...examples.GROUPED_CATEGORY_AXIS_EXAMPLE,
    data: DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY_EXTENDED.slice(0, 20),
};
