import { describe, expect, test } from '@jest/globals';
import 'jest-canvas-mock';
import { groupSeriesByType, reduceSeries, processSeriesOptions } from './prepareSeries';
import { AgBarSeriesOptions, AgLineSeriesOptions } from '../agChartOptions';

const colSeriesIPhone: AgBarSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'iphone',
    yName: 'Iphone',
};
const lineSeriesMac: AgLineSeriesOptions = {
    type: 'line',
    xKey: 'quarter',
    yKey: 'mac',
    yName: 'Mac',
};
const colSeriesMac: AgBarSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'mac',
    yName: 'Mac',
};
const lineSeriesIPhone: AgLineSeriesOptions = {
    type: 'line',
    xKey: 'quarter',
    yKey: 'iphone',
    yName: 'iPhone',
};
const colSeriesWearables: AgBarSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'wearables',
    yName: 'Wearables',
};
const colSeriesServices: AgBarSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'services',
    yName: 'Services',
};

const seriesOptions: Array<AgBarSeriesOptions | AgLineSeriesOptions> = [
    {
        ...colSeriesIPhone,
        fill: 'pink',
        showInLegend: true,
    },
    lineSeriesMac,
    {
        ...colSeriesMac,
        fill: 'red',
        showInLegend: false,
    },
    lineSeriesIPhone,
    {
        ...colSeriesWearables,
        showInLegend: true,
        grouped: true,
    },
    {
        ...colSeriesServices,
        showInLegend: false,
        grouped: true,
    },
];

describe('transform series options', () => {
    test('groupSeriesByType', () => {
        const result = groupSeriesByType(seriesOptions);
        const groupedSeriesOptions = [
            [seriesOptions[0], seriesOptions[2], seriesOptions[4], seriesOptions[5]],
            [seriesOptions[1]],
            [seriesOptions[3]],
        ];

        expect(result).toEqual(groupedSeriesOptions);
    });

    test('reduceSeries', () => {
        const columnSeriesGroup: any[] = [
            {
                ...colSeriesIPhone,
                fill: 'pink',
                showInLegend: true,
            },
            {
                ...colSeriesMac,
                fill: 'red',
                showInLegend: false,
            },
            {
                ...colSeriesWearables,
                fill: 'blue',
                showInLegend: true,
            },
            {
                ...colSeriesServices,
                fill: 'orange',
                showInLegend: false,
            },
        ];

        const result = reduceSeries(columnSeriesGroup);

        const columnSeriesOptions = {
            type: 'column',
            xKey: 'quarter',
            yKeys: ['iphone', 'mac', 'wearables', 'services'],
            yNames: ['Iphone', 'Mac', 'Wearables', 'Services'],
            fills: ['pink', 'red', 'blue', 'orange'],
            hideInLegend: ['mac', 'services'],
        };

        expect(result).toEqual(columnSeriesOptions);
    });

    test('reduceSeries - sparse properties', () => {
        const columnSeriesGroup: any[] = [
            {
                ...colSeriesIPhone,
                fill: 'pink',
            },
            {
                ...colSeriesMac,
                fill: 'red',
                visible: false,
            },
            {
                ...colSeriesWearables,
                fill: 'blue',
            },
            {
                ...colSeriesServices,
                fill: 'orange',
            },
        ];

        const result = reduceSeries(columnSeriesGroup);

        const columnSeriesOptions = {
            type: 'column',
            xKey: 'quarter',
            yKeys: ['iphone', 'mac', 'wearables', 'services'],
            yNames: ['Iphone', 'Mac', 'Wearables', 'Services'],
            fills: ['pink', 'red', 'blue', 'orange'],
            visibles: [true, false, true, true],
        };

        expect(result).toEqual(columnSeriesOptions);
    });

    test('processSeriesOptions', () => {
        const result = processSeriesOptions(seriesOptions);

        const processedSeriesOptions = [
            {
                type: 'column',
                xKey: 'quarter',
                yKeys: ['iphone', 'mac', 'wearables', 'services'],
                fills: ['pink', 'red'],
                yNames: ['Iphone', 'Mac', 'Wearables', 'Services'],
                hideInLegend: ['mac', 'services'],
                grouped: true,
            },
            {
                type: 'line',
                xKey: 'quarter',
                yKey: 'mac',
                yName: 'Mac',
            },
            { type: 'line', xKey: 'quarter', yKey: 'iphone', yName: 'iPhone' },
        ];

        expect(result).toEqual(processedSeriesOptions);
    });

    test('processSeriesOptions with grouped columns', () => {
        const result = processSeriesOptions(
            seriesOptions.map((s) => (s.type === 'column' ? { ...s, grouped: true } : s))
        );

        const processedSeriesOptions = [
            {
                type: 'column',
                xKey: 'quarter',
                yKeys: ['iphone', 'mac', 'wearables', 'services'],
                fills: ['pink', 'red'],
                yNames: ['Iphone', 'Mac', 'Wearables', 'Services'],
                hideInLegend: ['mac', 'services'],
                grouped: true,
            },
            {
                type: 'line',
                xKey: 'quarter',
                yKey: 'mac',
                yName: 'Mac',
            },
            { type: 'line', xKey: 'quarter', yKey: 'iphone', yName: 'iPhone' },
        ];

        expect(result).toEqual(processedSeriesOptions);
    });

    test('processSeriesOptions with stacked columns', () => {
        const result = processSeriesOptions(
            seriesOptions.map((s) => (s.type === 'column' ? { ...s, stacked: true, grouped: undefined } : s))
        );

        const processedSeriesOptions = [
            {
                type: 'column',
                xKey: 'quarter',
                yKeys: ['iphone', 'mac', 'wearables', 'services'],
                fills: ['pink', 'red'],
                yNames: ['Iphone', 'Mac', 'Wearables', 'Services'],
                hideInLegend: ['mac', 'services'],
                stacked: true,
            },
            {
                type: 'line',
                xKey: 'quarter',
                yKey: 'mac',
                yName: 'Mac',
            },
            { type: 'line', xKey: 'quarter', yKey: 'iphone', yName: 'iPhone' },
        ];

        expect(result).toEqual(processedSeriesOptions);
    });
});
