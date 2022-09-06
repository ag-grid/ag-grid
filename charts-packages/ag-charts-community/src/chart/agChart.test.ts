import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import 'jest-canvas-mock';
import { LegendPosition } from './legend';
import { AreaSeries } from './series/cartesian/areaSeries';
import { BarSeries } from './series/cartesian/barSeries';
import { LineSeries } from './series/cartesian/lineSeries';
import { ChartAxisPosition } from './chartAxis';
import { NumberAxis } from './axis/numberAxis';
import { ChartTheme } from './themes/chartTheme';
import { AgChartV2 } from './agChartV2';

const revenueProfitData = [
    {
        month: 'Jan',
        revenue: 155000,
        profit: 33000,
        foobar: 44700,
    },
    {
        month: 'Feb',
        revenue: 123000,
        profit: 35500,
        foobar: 23400,
    },
    {
        month: 'Mar',
        revenue: 172500,
        profit: 41000,
        foobar: 43400,
    },
    {
        month: 'Apr',
        revenue: 185000,
        profit: 50000,
        foobar: 23500,
    },
];

describe('update', () => {
    beforeEach(() => {
        console.warn = jest.fn();
    });

    afterEach(() => {
        expect(console.warn).not.toBeCalled();
    });

    test('cartesian chart top-level properties', () => {
        const chart = AgChartV2.create({
            // chart type is optional because it defaults to `cartesian`
            container: document.body,
            data: revenueProfitData,
            series: [
                {
                    // series type if optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'plus',
                        size: 20,
                    },
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    fill: 'lime',
                },
            ],
            legend: {
                item: {
                    paddingY: 16,
                },
            },
        });
        AgChartV2.update(chart, {
            width: 500,
            height: 500,
            autoSize: false,
            padding: {
                top: 30,
                right: 40,
                bottom: 50,
                left: 60,
            },
            subtitle: {
                enabled: false,
                text: 'My Subtitle',
                fontSize: 20,
            },
            background: {
                fill: 'red',
                visible: false,
            },
            series: [
                {
                    // series type if optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'plus',
                        size: 20,
                    },
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    fill: 'lime',
                },
            ],
            legend: {
                spacing: 50,
                position: LegendPosition.Bottom,
            },
        });

        const theme = new ChartTheme();

        expect(chart.container).toBeInstanceOf(HTMLElement);
        expect(chart.width).toBe(500);
        expect(chart.height).toBe(500);
        expect(chart.data.length).toBe(4);
        expect(chart.padding.top).toBe(30);
        expect(chart.padding.right).toBe(40);
        expect(chart.padding.bottom).toBe(50);
        expect(chart.padding.left).toBe(60);
        expect(chart.title!.enabled).toBe(theme.getConfig('cartesian.title.enabled'));
        expect(chart.title!.text).toBe(theme.getConfig('cartesian.title.text'));
        expect(chart.title!.fontSize).toBe(theme.getConfig('cartesian.title.fontSize'));
        expect(chart.title!.fontFamily).toBe(theme.getConfig('cartesian.title.fontFamily'));
        expect(chart.title!.fontStyle).toBe(theme.getConfig('cartesian.title.fontStyle'));
        expect(chart.title!.fontWeight).toBe(theme.getConfig('cartesian.title.fontWeight'));
        expect(chart.subtitle!.text).toBe('My Subtitle');
        expect(chart.subtitle!.fontSize).toBe(20);
        expect(chart.subtitle!.enabled).toBe(false);
        expect(chart.background.fill).toBe('red');
        expect(chart.background.visible).toBe(false);
        expect((chart.series[0] as any).marker.shape).toBe('plus');

        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {},
                },
                {
                    type: 'column',
                    xKey: 'month',
                    yKey: 'profit',
                    fill: 'lime',
                },
            ],
            legend: {
                item: {
                    paddingY: 16,
                },
            },
        });

        expect(chart.title!.enabled).toBe(theme.getConfig('cartesian.title.enabled'));
        expect(chart.title!.text).toBe(theme.getConfig('cartesian.title.text'));
        expect(chart.title!.fontSize).toBe(theme.getConfig('cartesian.title.fontSize'));
        expect(chart.title!.fontFamily).toBe(theme.getConfig('cartesian.title.fontFamily'));
        expect(chart.title!.fontStyle).toBe(theme.getConfig('cartesian.title.fontStyle'));
        expect(chart.title!.fontWeight).toBe(theme.getConfig('cartesian.title.fontWeight'));

        expect(chart.subtitle!.enabled).toBe(false);
        expect(chart.subtitle!.text).toBe('My Subtitle');
        expect(chart.subtitle!.fontSize).toBe(20);
    });

    test('series', () => {
        const chart = AgChartV2.create({
            data: revenueProfitData,
            series: [
                {
                    // series type is optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'plus',
                        size: 20,
                    },
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    fill: 'lime',
                },
            ],
        });
        const createdSeries = chart.series;

        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    // series type if optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'square',
                        size: 10,
                    },
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    fill: 'lime',
                    stacked: true,
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'foobar',
                    fill: 'cyan',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'foobar',
                },
            ],
        });
        const updatedSeries = chart.series;

        expect(updatedSeries.length).toEqual(3);
        expect(updatedSeries[0]).not.toBe(createdSeries[0]);
        expect(updatedSeries[1]).not.toBe(createdSeries[1]);
        expect((updatedSeries[0] as any).marker.shape).toEqual('square');
        expect((updatedSeries[0] as any).marker.size).toEqual(10);
        expect((updatedSeries[1] as any).fills).toEqual(['lime', 'cyan']);
        expect((updatedSeries[1] as any).yKeys).toEqual([['profit', 'foobar']]);
        expect(updatedSeries[2]).toBeInstanceOf(AreaSeries);
        expect((updatedSeries[2] as any).xKey).toEqual('month');
        expect((updatedSeries[2] as any).yKeys).toEqual(['foobar']);

        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    // series type is optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'square',
                        size: 10,
                    },
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    fill: 'lime',
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'foobar',
                    fill: 'cyan',
                },
            ],
        });
        const updatedSeries2 = chart.series;

        expect(updatedSeries2.length).toBe(2);
        expect(updatedSeries2[0]).not.toBe(updatedSeries[0]);
        expect(updatedSeries2[1]).not.toBe(updatedSeries[1]);

        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    stacked: true,
                    fill: 'lime',
                },
                {
                    type: 'column', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'foobar',
                    stacked: true,
                    fill: 'cyan',
                },
                {
                    // series type is optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'square',
                        size: 10,
                    },
                },
            ],
        });
        const updatedSeries3 = chart.series;

        expect(updatedSeries3.length).toBe(2);
        expect(updatedSeries3[0]).not.toBe(updatedSeries2[0]);
        expect(updatedSeries3[1]).not.toBe(updatedSeries2[1]);
        expect(updatedSeries3[0]).toBeInstanceOf(BarSeries);
        expect(updatedSeries3[1]).toBeInstanceOf(LineSeries);
        expect((updatedSeries3[0] as any).yKeys).toEqual([['profit', 'foobar']]);
        expect((updatedSeries3[1] as any).yKey).toEqual('revenue');
        expect((updatedSeries3[1] as any).marker.size).toEqual(10);

        const lineSeries = updatedSeries3[1];

        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    type: 'area', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'profit',
                    stacked: true,
                    fill: 'lime',
                },
                {
                    type: 'area', // have to specify type explicitly here
                    xKey: 'month',
                    yKey: 'foobar',
                    stacked: true,
                    fill: 'cyan',
                },
                {
                    // series type if optional because `line` is default for `cartesian` charts
                    xKey: 'month',
                    yKey: 'revenue',
                    marker: {
                        shape: 'square',
                        size: 10,
                    },
                },
            ],
        });
        const updatedSeries4 = chart.series;

        expect(updatedSeries4.length).toEqual(2);
        expect(updatedSeries4[0]).toBeInstanceOf(AreaSeries);
        expect(updatedSeries4[1]).toBeInstanceOf(LineSeries);
        expect(updatedSeries4[1]).not.toBe(lineSeries);
    });

    test('axes', () => {
        let chart = AgChartV2.create({
            data: revenueProfitData,
            series: [
                {
                    xKey: 'month',
                    yKey: 'revenue',
                },
            ],
        });

        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    xKey: 'blah',
                    yKey: 'revenue',
                },
            ],
            axes: [
                {
                    type: 'number',
                    position: 'left',
                    title: {
                        text: 'Hello',
                    },
                },
                {
                    type: 'number',
                    position: 'bottom',
                },
            ],
        });

        let axes = chart.axes;
        expect(axes.length).toBe(2);
        expect(axes[0] instanceof NumberAxis).toBe(true);
        expect(axes[1] instanceof NumberAxis).toBe(true);
        let leftAxis = axes.find((axis) => axis.position === ChartAxisPosition.Left);
        expect(axes.find((axis) => axis.position === ChartAxisPosition.Bottom)).toBeDefined();
        expect(leftAxis).toBeDefined();
        expect(leftAxis!.title!.text).toBe('Hello');

        expect(leftAxis!.gridStyle).toEqual([
            {
                stroke: 'rgb(219, 219, 219)',
                lineDash: [4, 2],
            },
        ]);
        AgChartV2.update(chart, {
            data: revenueProfitData,
            series: [
                {
                    xKey: 'blah',
                    yKey: 'revenue',
                },
            ],
            axes: [
                {
                    type: 'number',
                    position: 'left',
                    title: {
                        text: 'Hello',
                    },
                    gridStyle: [
                        {
                            stroke: 'red',
                            lineDash: [5, 5],
                        },
                        {
                            stroke: 'blue',
                            lineDash: [2, 6, 2],
                        },
                    ],
                },
                {
                    type: 'number',
                    position: 'bottom',
                },
            ],
        });

        leftAxis = chart.axes.find((axis) => axis.position === ChartAxisPosition.Left);
        expect(leftAxis!.gridStyle).toEqual([
            {
                stroke: 'red',
                lineDash: [5, 5],
            },
            {
                stroke: 'blue',
                lineDash: [2, 6, 2],
            },
        ]);
    });
});
