import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import {
    AgCartesianChartOptions,
    AgCartesianSeriesMarkerFormatter,
    AgChartTheme,
    AgPolarChartOptions,
} from '../agChartOptions';
import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries } from '../series/cartesian/barSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { ChartTheme } from './chartTheme';
import { AgChart } from '../agChartV2';
import { CartesianChart } from '../cartesianChart';
import { PolarChart } from '../polarChart';
import { LineSeries } from '../series/cartesian/lineSeries';
import { deproxy, waitForChartStability } from '../test/utils';

const data = [
    { label: 'Android', v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
    { label: 'iOS', v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
    { label: 'BlackBerry', v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
    { label: 'Symbian', v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
    { label: 'Windows', v1: 2.8, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.8 },
];

describe('ChartTheme', () => {
    describe('cartesian overrides', () => {
        const tooltipRenderer = () => 'testing';
        const markerFormatter: AgCartesianSeriesMarkerFormatter<any> = () => {
            return {};
        };

        const theme: AgChartTheme = {
            baseTheme: 'ag-default',
            palette: {
                fills: ['red', 'green', 'blue'],
                strokes: ['cyan'],
            },
            overrides: {
                cartesian: {
                    title: {
                        fontSize: 24,
                        fontWeight: 'bold',
                    },
                    background: {
                        fill: 'red',
                        // image: {
                        //     url: 'https://example.com',
                        //     width: 10,
                        //     height: 20,
                        // },
                    },
                    series: {
                        column: {
                            label: {
                                enabled: true,
                                color: 'yellow',
                                fontSize: 20,
                            },
                            tooltip: {
                                enabled: false,
                                renderer: tooltipRenderer,
                            },
                        },
                        area: {
                            marker: {
                                formatter: markerFormatter,
                            },
                        },
                    },
                },
            },
        };
        const cartesianChartOptions: AgCartesianChartOptions = {
            theme,
            title: {
                enabled: true,
                text: 'Test Chart',
                fontWeight: 'normal',
            },
            data,
            series: [
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v1',
                    yName: 'Reliability',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v2',
                    yName: 'Ease of use',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v3',
                    yName: 'Performance',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v4',
                    yName: 'Price',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v5',
                    yName: 'Market share',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'area',
                    xKey: 'label',
                    yKey: 'v1',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'label',
                    yKey: 'v2',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'label',
                    yKey: 'v3',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'label',
                    yKey: 'v4',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'label',
                    yKey: 'v5',
                    stacked: true,
                },
            ],
        };

        const serializedOptions = JSON.stringify(cartesianChartOptions);
        let chart: CartesianChart;

        beforeEach(() => {
            chart = deproxy(AgChart.create(cartesianChartOptions)) as CartesianChart;
        });
        afterEach(() => {
            chart.destroy();
            (chart as any) = null;
        });

        test('Options are not mutated after AgChart.create', () => {
            expect(JSON.stringify(cartesianChartOptions)).toBe(serializedOptions);
        });

        test('Cartesian chart instance properties', () => {
            expect(chart.title && chart.title.enabled).toBe(true);
            expect(chart.title && chart.title.fontSize).toBe(24);
            expect(chart.title && chart.title.fontWeight).toBe('normal');

            expect(chart.background.fill).toBe('red');
            // expect(chart.background.image?.url).toBe('https://example.com/');
            // expect(chart.background.image?.width).toBe(10);
            // expect(chart.background.image?.height).toBe(20);

            expect(chart.series[0].type).toBe('bar');
            expect((chart.series[0] as BarSeries).fills).toEqual(['red', 'green', 'blue', 'red', 'green']);
            expect((chart.series[0] as BarSeries).strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
            expect((chart.series[0] as BarSeries).label.enabled).toBe(true);
            expect((chart.series[0] as BarSeries).label.color).toBe('yellow');
            expect((chart.series[0] as BarSeries).label.fontSize).toBe(18);
            expect((chart.series[0] as BarSeries).tooltip.enabled).toBe(false);
            expect((chart.series[0] as BarSeries).tooltip.renderer).toBe(tooltipRenderer);

            expect(chart.series[1].type).toBe('area');
            expect((chart.series[1] as unknown as AreaSeries).fills).toEqual(['blue', 'red', 'green', 'blue', 'red']);
            expect((chart.series[1] as unknown as AreaSeries).strokes).toEqual([
                'cyan',
                'cyan',
                'cyan',
                'cyan',
                'cyan',
            ]);
            expect((chart.series[1] as unknown as AreaSeries).marker.formatter).toBe(markerFormatter);
        });
    });

    describe('polar overrides', () => {
        const tooltipRenderer = () => 'testing';
        const theme: AgChartTheme = {
            baseTheme: 'ag-default',
            palette: {
                fills: ['red', 'green', 'blue'],
                strokes: ['cyan'],
            },
            overrides: {
                polar: {
                    title: {
                        fontSize: 24,
                        fontWeight: 'bold',
                    },
                    background: {
                        fill: 'red',
                    },
                    series: {
                        pie: {
                            calloutLabel: {
                                enabled: true,
                                color: 'yellow',
                                fontSize: 20,
                            },
                            tooltip: {
                                enabled: false,
                                renderer: tooltipRenderer,
                            },
                        },
                    },
                },
            },
        };
        const polarChartOptions: AgPolarChartOptions = {
            theme,
            title: {
                enabled: true,
                text: 'Test Chart',
                fontWeight: 'normal',
            },
            data,
            series: [
                {
                    type: 'pie',
                    angleKey: 'v1',
                    calloutLabelKey: 'label',
                    calloutLabel: {
                        fontSize: 18,
                    },
                },
            ],
        };

        const serializedOptions = JSON.stringify(polarChartOptions);
        let chart: PolarChart;

        beforeEach(() => {
            chart = deproxy(AgChart.create(polarChartOptions)) as PolarChart;
        });
        afterEach(() => {
            chart.destroy();
            (chart as any) = null;
        });

        test('Options are not mutated after AgChart.create', () => {
            expect(JSON.stringify(polarChartOptions)).toBe(serializedOptions);
        });

        test('Polar chart intstance properties', () => {
            expect(chart.title && chart.title.enabled).toBe(true);
            expect(chart.title && chart.title.fontSize).toBe(24);
            expect(chart.title && chart.title.fontWeight).toBe('normal');

            expect(chart.background.fill).toBe('red');

            expect(chart.series[0].type).toBe('pie');
            expect((chart.series[0] as PieSeries).fills).toEqual(['red', 'green', 'blue']);
            expect((chart.series[0] as PieSeries).strokes).toEqual(['cyan', 'cyan', 'cyan']);
            expect((chart.series[0] as PieSeries).calloutLabel.enabled).toBe(true);
            expect((chart.series[0] as PieSeries).calloutLabel.color).toBe('yellow');
            expect((chart.series[0] as PieSeries).calloutLabel.fontSize).toBe(18);
            expect((chart.series[0] as PieSeries).tooltip.enabled).toBe(false);
            expect((chart.series[0] as PieSeries).tooltip.renderer).toBe(tooltipRenderer);
        });
    });

    describe('common overrides', () => {
        const columnTooltipRenderer = () => 'testing';
        const pieTooltipRenderer = () => 'testing';

        const theme: AgChartTheme = {
            baseTheme: 'ag-default',
            palette: {
                fills: ['red', 'green', 'blue'],
                strokes: ['cyan'],
            },
            overrides: {
                common: {
                    title: {
                        fontSize: 24,
                        fontWeight: 'bold',
                    },
                    background: {
                        fill: 'red',
                    },
                    series: {
                        column: {
                            label: {
                                enabled: true,
                                color: 'blue',
                                fontSize: 22,
                            },
                            tooltip: {
                                enabled: false,
                                renderer: columnTooltipRenderer,
                            },
                        },
                        pie: {
                            calloutLabel: {
                                enabled: true,
                                color: 'yellow',
                                fontSize: 20,
                            },
                            tooltip: {
                                enabled: false,
                                renderer: pieTooltipRenderer,
                            },
                        },
                    },
                },
            },
        };

        const cartesianChartOptions: AgCartesianChartOptions = {
            theme,
            title: {
                enabled: true,
                text: 'Test Chart',
                fontWeight: 'normal',
            },
            data,
            series: [
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v1',
                    yName: 'Reliability',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v2',
                    yName: 'Ease of use',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v3',
                    yName: 'Performance',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v4',
                    yName: 'Price',
                    label: {
                        fontSize: 18,
                    },
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v5',
                    yName: 'Market share',
                    label: {
                        fontSize: 18,
                    },
                },
            ],
        };

        const polarChartOptions: AgPolarChartOptions = {
            theme,
            title: {
                enabled: true,
                text: 'Test Chart',
                fontWeight: 'normal',
            },
            data,
            series: [
                {
                    type: 'pie',
                    angleKey: 'v1',
                    calloutLabelKey: 'label',
                    calloutLabel: {
                        fontSize: 18,
                    },
                },
            ],
        };

        test('Cartesian chart instance properties', async () => {
            const cartesianChart = deproxy(AgChart.create(cartesianChartOptions));
            await waitForChartStability(cartesianChart);

            expect(cartesianChart!.title && cartesianChart!.title.enabled).toBe(true);
            expect(cartesianChart!.title && cartesianChart!.title.fontSize).toBe(24);
            expect(cartesianChart!.title && cartesianChart!.title.fontWeight).toBe('normal');

            expect(cartesianChart!.background.fill).toBe('red');

            expect(cartesianChart!.series[0].type).toBe('bar');
            expect((cartesianChart!.series[0] as BarSeries).fills).toEqual(['red', 'green', 'blue', 'red', 'green']);
            expect((cartesianChart!.series[0] as BarSeries).strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
            expect((cartesianChart!.series[0] as BarSeries).label.enabled).toBe(true);
            expect((cartesianChart!.series[0] as BarSeries).label.color).toBe('blue');
            expect((cartesianChart!.series[0] as BarSeries).label.fontSize).toBe(18);
            expect((cartesianChart!.series[0] as BarSeries).tooltip.enabled).toBe(false);
            expect((cartesianChart!.series[0] as BarSeries).tooltip.renderer).toBe(columnTooltipRenderer);
        });

        test('Polar chart intstance properties', async () => {
            const polarChart = deproxy(AgChart.create(polarChartOptions));
            await waitForChartStability(polarChart);

            expect(polarChart!.title && polarChart!.title.enabled).toBe(true);
            expect(polarChart!.title && polarChart!.title.fontSize).toBe(24);
            expect(polarChart!.title && polarChart!.title.fontWeight).toBe('normal');

            expect(polarChart!.background.fill).toBe('red');

            expect(polarChart!.series[0].type).toBe('pie');
            expect((polarChart!.series[0] as PieSeries).fills).toEqual(['red', 'green', 'blue']);
            expect((polarChart!.series[0] as PieSeries).strokes).toEqual(['cyan', 'cyan', 'cyan']);
            expect((polarChart!.series[0] as PieSeries).calloutLabel.enabled).toBe(true);
            expect((polarChart!.series[0] as PieSeries).calloutLabel.color).toBe('yellow');
            expect((polarChart!.series[0] as PieSeries).calloutLabel.fontSize).toBe(18);
            expect((polarChart!.series[0] as PieSeries).tooltip.enabled).toBe(false);
            expect((polarChart!.series[0] as PieSeries).tooltip.renderer).toBe(pieTooltipRenderer);
        });
    });

    describe('Position specific axis styling', () => {
        const theme: AgChartTheme = {
            baseTheme: 'ag-default',
            overrides: {
                cartesian: {
                    axes: {
                        category: {
                            line: {
                                color: 'red',
                            },
                            label: {
                                fontSize: 12,
                            },

                            top: {},
                            right: {
                                line: {
                                    color: 'green',
                                },
                                label: {
                                    fontSize: 14,
                                },
                            },
                            bottom: {
                                line: {
                                    color: 'blue',
                                },
                                label: {
                                    fontSize: 18,
                                },
                            },
                            left: {
                                line: {
                                    color: 'gold',
                                },
                                label: {
                                    fontSize: 20,
                                },
                            },
                        },
                        number: {
                            top: {},
                            right: {
                                line: {
                                    color: 'blue',
                                },
                                label: {
                                    fontSize: 18,
                                },
                            },
                            bottom: {},
                            left: {},
                        },
                    },
                },
            },
        };

        let defaultTheme: ChartTheme;
        beforeEach(() => {
            defaultTheme = new ChartTheme();
        });
        afterEach(() => {
            (defaultTheme as any) = null;
        });

        test('Themed bottom category, unthemed left number', async () => {
            const chart = deproxy(
                AgChart.create({
                    theme,
                    data,
                    series: [
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v1',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v2',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v3',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v4',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v5',
                        },
                    ],
                } as AgCartesianChartOptions)
            );
            await waitForChartStability(chart);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('left');
            expect(chart.axes[0].line.color).toBe(defaultTheme.config.cartesian.axes.number.line.color);
            expect(chart.axes[0].label.fontSize).toBe(defaultTheme.config.cartesian.axes.number.label.fontSize);

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('bottom');
            expect(chart.axes[1].line.color).toBe('blue');
            expect(chart.axes[1].label.fontSize).toBe(18);
        });

        test('Specialized chart type themed bottom category, unthemed left number', async () => {
            const chart = deproxy(
                AgChart.create({
                    type: 'area',
                    theme,
                    data,
                    series: [
                        {
                            xKey: 'label',
                            yKey: 'v1',
                        },
                        {
                            xKey: 'label',
                            yKey: 'v2',
                        },
                        {
                            xKey: 'label',
                            yKey: 'v3',
                        },
                        {
                            xKey: 'label',
                            yKey: 'v4',
                        },
                        {
                            xKey: 'label',
                            yKey: 'v5',
                        },
                    ],
                } as AgCartesianChartOptions)
            );
            await waitForChartStability(chart);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('left');
            expect(chart.axes[0].line.color).toBe(defaultTheme.config.cartesian.axes.number.line.color);
            expect(chart.axes[0].label.fontSize).toBe(defaultTheme.config.cartesian.axes.number.label.fontSize);

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('bottom');
            expect(chart.axes[1].line.color).toBe('blue');
            expect(chart.axes[1].label.fontSize).toBe(18);
        });

        test('Themed right number, unthemed top category', async () => {
            const chart = deproxy(
                AgChart.create({
                    theme,
                    data,
                    axes: [
                        {
                            type: 'number',
                            position: 'right',
                        },
                        {
                            type: 'category',
                            position: 'top',
                        },
                    ],
                    series: [
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v1',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v2',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v3',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v4',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v5',
                        },
                    ],
                } as AgCartesianChartOptions)
            );
            await waitForChartStability(chart);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('right');
            expect(chart.axes[0].line.color).toBe('blue');
            expect(chart.axes[0].label.fontSize).toBe(18);

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('top');
            expect(chart.axes[1].line.color).toBe('red');
            expect(chart.axes[1].label.fontSize).toBe(12);
        });

        test('Partially themed axes', async () => {
            const chart = deproxy(
                AgChart.create({
                    theme,
                    data,
                    axes: [
                        {
                            type: 'number',
                            position: 'right',
                            line: {
                                color: 'red',
                            },
                            label: {
                                fontStyle: 'italic',
                                fontFamily: 'Tahoma',
                            },
                        },
                        {
                            type: 'category',
                            position: 'bottom',
                            line: {
                                width: 5,
                            },
                            label: {
                                fontWeight: 'bold',
                                rotation: 45,
                            },
                            title: {
                                text: 'Test',
                            },
                        },
                    ],
                    series: [
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v1',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v2',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v3',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v4',
                        },
                        {
                            type: 'area',
                            xKey: 'label',
                            yKey: 'v5',
                        },
                    ],
                } as AgCartesianChartOptions)
            );
            await waitForChartStability(chart);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('right');
            expect(chart.axes[0].line.color).toBe('red');
            expect(chart.axes[0].label.fontSize).toBe(18);
            expect(chart.axes[0].label.fontStyle).toBe('italic');
            expect(chart.axes[0].label.fontFamily).toBe('Tahoma');
            expect(chart.axes[0].label.fontWeight).toBe(defaultTheme.config.cartesian.axes.number.label.fontWeight);
            expect(chart.axes[0].label.padding).toBe(defaultTheme.config.cartesian.axes.number.label.padding);
            expect(chart.axes[0].label.rotation).toBe(defaultTheme.config.cartesian.axes.number.label.rotation);

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('bottom');
            expect(chart.axes[1].line.color).toBe('blue');
            expect(chart.axes[1].line.width).toBe(5);
            expect(chart.axes[1].label.fontSize).toBe(18);
            expect(chart.axes[1].label.fontStyle).toBe(defaultTheme.config.cartesian.axes.category.label.fontStyle);
            expect(chart.axes[1].label.fontFamily).toBe(defaultTheme.config.cartesian.axes.category.label.fontFamily);
            expect(chart.axes[1].label.fontWeight).toBe('bold');
            expect(chart.axes[1].label.rotation).toBe(45);
            expect(chart.axes[1].title && chart.axes[1].title.text).toBe('Test');
            // Since config is provided, the `enabled` should be auto-set to `true`,
            // even though theme's default is `false`.
            expect(chart.axes[1].title && chart.axes[1].title.enabled).toBe(true);
        });
    });

    describe('series overrides', () => {
        const theme: AgChartTheme = {
            baseTheme: 'ag-default',
            palette: {
                fills: ['red', 'green', 'blue'],
                strokes: ['cyan'],
            },
            overrides: {
                common: {
                    series: {
                        column: {
                            strokeWidth: 10,
                        },
                        line: {
                            strokeWidth: 11,
                        },
                        area: {
                            strokeWidth: 12,
                        },
                    },
                },
                cartesian: {
                    series: {
                        column: {
                            strokeWidth: 13,
                        },
                        line: {
                            strokeWidth: 14,
                        },
                        area: {
                            strokeWidth: 15,
                        },
                    },
                },
                column: {
                    series: {
                        strokeWidth: 16,
                    },
                },
                line: {
                    series: {
                        strokeWidth: 17,
                    },
                },
                area: {
                    series: {
                        strokeWidth: 18,
                    },
                },
            },
        };

        const cartesianChartOptions: AgCartesianChartOptions = {
            theme,
            data,
            series: [
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v1',
                    yName: 'Reliability',
                },
                {
                    type: 'column',
                    xKey: 'label',
                    yKey: 'v2',
                    yName: 'Ease of use',
                },
                {
                    type: 'line',
                    xKey: 'label',
                    yKey: 'v3',
                    yName: 'Performance',
                },
                {
                    type: 'area',
                    xKey: 'label',
                    yKey: 'v4',
                    yName: 'Price',
                },
            ],
        };

        test('Cartesian chart instance properties', async () => {
            const cartesianChart = deproxy(AgChart.create(cartesianChartOptions));
            await waitForChartStability(cartesianChart);
            const { series } = cartesianChart;

            expect(series[0].type).toEqual('bar');
            expect(series[1].type).toEqual('line');
            expect(series[2].type).toEqual('area');
            expect((series[0] as BarSeries).strokeWidth).toEqual(16);
            expect((series[1] as LineSeries).strokeWidth).toEqual(17);
            expect((series[2] as unknown as AreaSeries).strokeWidth).toEqual(18);
        });
    });
});
