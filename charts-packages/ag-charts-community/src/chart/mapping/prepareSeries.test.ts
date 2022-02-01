import { describe, expect, test } from "@jest/globals";
import "jest-canvas-mock";
import { groupSeriesByType, reduceSeries, processSeriesOptions } from "./prepareSeries";

const seriesOptions: any = [
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
        yKeys: ['wearables', 'services'],
        yNames: ['iPad', 'Wearables', 'Services'],
        hideInLegend: ['services'],
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
                    yKeys: ['wearables', 'services'],
                    yNames: ['iPad', 'Wearables', 'Services'],
                    hideInLegend: ['services'],
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
                yKeys: ['wearables', 'services'],
                yNames: ['iPad', 'Wearables', 'Services'],
                fills: ['blue', 'orange', 'yellow'],
                hideInLegend: ['services'],
            },
        ];

        const result = reduceSeries(columnSeriesGroup, true);

        const columnSeriesOptions = {
            type: 'column',
            xKey: 'quarter',
            yKeys: ['iphone', 'mac', 'wearables', 'services'],
            fills: ['pink', 'red', 'blue', 'orange', 'yellow'],
            yNames: ['Iphone', 'Mac', 'iPad', 'Wearables', 'Services'],
            hideInLegend: ['mac', 'services'],
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
                yNames: ['Iphone', 'Mac', 'iPad', 'Wearables', 'Services'],
                hideInLegend: ['mac', 'services'],
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
