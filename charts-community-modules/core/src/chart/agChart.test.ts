import { AgChart } from "./agChart";
const raf = require('raf');
// const { createCanvas } = require('canvas');
import 'jest-canvas-mock';
import { LegendPosition } from "./legend";

const data1 = [{
    month: 'Jan',
    revenue: 155000,
    profit: 33000,
    foobar: 44700
}, {
    month: 'Feb',
    revenue: 123000,
    profit: 35500,
    foobar: 23400
}, {
    month: 'Mar',
    revenue: 172500,
    profit: 41000,
    foobar: 43400
}, {
    month: 'Apr',
    revenue: 185000,
    profit: 50000,
    foobar: 23500
}];

const data2 = [{
    month: 'Mar',
    apples: 2,
    oranges: 3
}, {
    month: 'May',
    apples: 4,
    oranges: 5
}, {
    month: 'Jun',
    apples: 6,
    oranges: 7
}, {
    month: 'Jul',
    apples: 8,
    oranges: 9
}];

describe('update', () => {
    test('cartesian chart top-level properties', () => {
        const chart = AgChart.create({
            // chart type is optional because it defaults to `cartesian`
            container: document.body,
            data: data1,
            series: [{
                // series type if optional because `line` is default for `cartesian` charts
                xKey: 'month',
                yKey: 'revenue',
                marker: {
                    shape: 'plus',
                    size: 20
                }
            }, {
                type: 'column', // have to specify type explicitly here
                xKey: 'month',
                yKeys: ['profit'],
                fills: ['lime']
            }],
            legend: {
                itemPaddingY: 16
            }
        });
        AgChart.update(chart, {
            width: 500,
            height: 500,
            padding: {
                top: 30,
                right: 40,
                bottom: 50,
                left: 60
            },
            subtitle: {
                enabled: false,
                text: 'My Subtitle',
                fontSize: 20
            },
            background: {
                fill: 'red',
                visible: false
            },
            series: [{
                // series type if optional because `line` is default for `cartesian` charts
                xKey: 'month',
                yKey: 'revenue',
                marker: {
                    shape: 'plus',
                    size: 20
                }
            }, {
                type: 'column', // have to specify type explicitly here
                xKey: 'month',
                yKeys: ['profit'],
                fills: ['lime']
            }],
            legend: {
                padding: 50,
                position: LegendPosition.Bottom
            }
        });

        expect(chart.container).toBe(undefined);
        expect(chart.width).toBe(500);
        expect(chart.height).toBe(500);
        expect(chart.data.length).toBe(0);
        expect(chart.padding.top).toBe(30);
        expect(chart.padding.right).toBe(40);
        expect(chart.padding.bottom).toBe(50);
        expect(chart.padding.left).toBe(60);
        expect(chart.title).toBe(undefined);
        expect(chart.subtitle.text).toBe('My Subtitle');
        expect(chart.subtitle.fontSize).toBe(20);
        expect(chart.subtitle.enabled).toBe(false);
        expect(chart.background.fill).toBe('red');
        expect(chart.background.visible).toBe(false);
    });

    test('series', () => {
        const chart = AgChart.create({
            data: data1,
            series: [{
                // series type if optional because `line` is default for `cartesian` charts
                xKey: 'month',
                yKey: 'revenue',
                marker: {
                    shape: 'plus',
                    size: 20
                }
            }, {
                type: 'column', // have to specify type explicitly here
                xKey: 'month',
                yKeys: ['profit'],
                fills: ['lime']
            }]
        });
        const firstSeries = chart.series[0];
        const secondSeries = chart.series[1];
        AgChart.update(chart, {
            data: data1,
            series: [{
                // series type if optional because `line` is default for `cartesian` charts
                xKey: 'month',
                yKey: 'revenue',
                marker: {
                    shape: 'plus',
                    size: 10
                }
            }, {
                type: 'column', // have to specify type explicitly here
                xKey: 'month',
                yKeys: ['profit'],
                fills: ['lime', 'cyan']
            }]
        });
        expect(chart.series[0]).toBe(firstSeries);
        expect(chart.series[1]).toBe(secondSeries);
        // expect(chart.series[0].marker.size).toBe(10);
        expect(chart.series[1].fills).toEqual(['lime', 'cyan']);
    });
});
