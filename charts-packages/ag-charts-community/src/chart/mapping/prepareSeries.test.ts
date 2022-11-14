import { describe, expect, test } from '@jest/globals';
import 'jest-canvas-mock';
import { groupSeriesByType, reduceSeries, processSeriesOptions } from './prepareSeries';
import { AgBarSeriesOptions, AgLineSeriesOptions } from '../agChartOptions';

const seriesOptions: ((AgBarSeriesOptions | AgLineSeriesOptions) & { hideInLegend?: string[] })[] = [
    {
        type: 'column',
        xKey: 'quarter',
        yKey: 'iphone',
        fill: 'pink',
        yName: 'Iphone',
        showInLegend: true,
    },
    {
        type: 'line',
        xKey: 'quarter',
        yKey: 'mac',
        yName: 'Mac',
    },
    {
        type: 'column',
        xKey: 'quarter',
        yKey: 'mac',
        fill: 'red',
        yName: 'Mac',
        showInLegend: false,
    },
    {
        type: 'line',
        xKey: 'quarter',
        yKey: 'iphone',
        yName: 'iPhone',
    },
    {
        type: 'column',
        xKey: 'quarter',
        yKey: 'wearables',
        yName: 'Wearables',
        showInLegend: true,
        grouped: true,
    },
    {
        type: 'column',
        xKey: 'quarter',
        yKey: 'services',
        yName: 'Services',
        showInLegend: false,
        grouped: true,
    },
];

describe('transform series options', () => {
    test('groupSeriesByType', () => {
        const result = groupSeriesByType(seriesOptions);
        const groupedSeriesOptions = [
            [
                {
                    type: 'column',
                    xKey: 'quarter',
                    yKey: 'iphone',
                    fill: 'pink',
                    yName: 'Iphone',
                    showInLegend: true,
                },
                {
                    type: 'column',
                    xKey: 'quarter',
                    yKey: 'mac',
                    fill: 'red',
                    yName: 'Mac',
                    showInLegend: false,
                },
                {
                    type: 'column',
                    xKey: 'quarter',
                    yKey: 'wearables',
                    yName: 'Wearables',
                    showInLegend: true,
                    grouped: true,
                },
                {
                    type: 'column',
                    xKey: 'quarter',
                    yKey: 'services',
                    yName: 'Services',
                    showInLegend: false,
                    grouped: true,
                },
            ],
            [
                {
                    type: 'line',
                    xKey: 'quarter',
                    yKey: 'mac',
                    yName: 'Mac',
                },
            ],
            [
                {
                    type: 'line',
                    xKey: 'quarter',
                    yKey: 'iphone',
                    yName: 'iPhone',
                },
            ],
        ];

        expect(result).toEqual(groupedSeriesOptions);
    });

    test('reduceSeries', () => {
        const columnSeriesGroup: any[] = [
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'iphone',
                fill: 'pink',
                yName: 'Iphone',
                showInLegend: true,
            },
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'mac',
                fill: 'red',
                yName: 'Mac',
                showInLegend: false,
            },
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'wearables',
                yName: 'Wearables',
                fill: 'blue',
                showInLegend: true,
            },
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'services',
                yName: 'Services',
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
                type: 'column',
                xKey: 'quarter',
                yKey: 'iphone',
                fill: 'pink',
                yName: 'Iphone',
            },
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'mac',
                fill: 'red',
                yName: 'Mac',
                visible: false,
            },
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'wearables',
                yName: 'Wearables',
                fill: 'blue',
            },
            {
                type: 'column',
                xKey: 'quarter',
                yKey: 'services',
                yName: 'Services',
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
