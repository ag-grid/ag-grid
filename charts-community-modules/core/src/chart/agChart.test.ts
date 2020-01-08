import { AgChart } from "./agChart";
const raf = require('raf');
// const { createCanvas } = require('canvas');
import 'jest-canvas-mock';

const data1 = [{
    month: 'Jan',
    revenue: 155000,
    profit: 33000
}, {
    month: 'Feb',
    revenue: 123000,
    profit: 35500
}, {
    month: 'Mar',
    revenue: 172500,
    profit: 41000
}, {
    month: 'Apr',
    revenue: 185000,
    profit: 50000
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
    test('', () => {
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
            legend: {}
        });
        AgChart.update(chart, {
            data: data2,
            width: 300,
            height: 400,
            series: [{
                // series type if optional because `line` is default for `cartesian` charts
                xKey: 'month',
                yKey: 'apples',
                marker: {
                    shape: 'plus',
                    size: 20
                }
            }, {
                type: 'column', // have to specify type explicitly here
                xKey: 'month',
                yKeys: ['oranges'],
                fills: ['lime']
            }]
        });
    });
});
