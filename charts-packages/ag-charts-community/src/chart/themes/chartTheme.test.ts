import { AgChart } from "../agChart";
import { AgCartesianChartOptions, AgChartTheme, AgPolarChartOptions } from "../agChartOptions";
import { BarSeries } from "../series/cartesian/barSeries";
import { PieSeries } from "../series/polar/pieSeries";

describe("cartesian overrides", () => {
    const tooltipRenderer = () => 'testing';
    const theme: AgChartTheme = {
        baseTheme: 'ag-default',
        palette: {
            fills: ['red', 'green', 'blue'],
            strokes: ['cyan']
        },
        overrides: {
            cartesian: {
                title: {
                    fontSize: 24,
                    fontWeight: 'bold'
                },
                background: {
                    fill: 'red'
                },
                series: {
                    column: {
                        label: {
                            enabled: true,
                            color: 'yellow',
                            fontSize: 20
                        },
                        tooltip: {
                            enabled: false,
                            renderer: tooltipRenderer
                        }
                    }
                }
            }
        }
    };
    const options: AgCartesianChartOptions = {
        theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data: [
            { label: 'Android', v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
            { label: 'iOS', v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
            { label: 'BlackBerry', v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
            { label: 'Symbian', v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
            { label: 'Windows', v1: 2.80, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.80 }
        ],
        series: [{
            type: 'column',
            xKey: 'label',
            yKeys: ['v1', 'v2', 'v3', 'v4', 'v5'],
            yNames: ['Reliability', 'Ease of use', 'Performance', 'Price', 'Market share'],
            label: {
                fontSize: 18
            }
        }]
    };

    const chart = AgChart.create(options);

    test("Chart instance properties", () => {
        expect(chart.title && chart.title.enabled).toBe(true);
        expect(chart.title && chart.title.fontSize).toBe(24);
        expect(chart.title && chart.title.fontWeight).toBe('normal');

        expect(chart.background.fill).toBe('red');

        expect(chart.series[0].type).toBe('bar');
        expect((chart.series[0] as BarSeries).fills).toEqual(['red', 'green', 'blue', 'red', 'green']);
        expect((chart.series[0] as BarSeries).strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
        expect((chart.series[0] as BarSeries).label.enabled).toBe(true);
        expect((chart.series[0] as BarSeries).label.color).toBe('yellow');
        expect((chart.series[0] as BarSeries).label.fontSize).toBe(18);
        expect((chart.series[0] as BarSeries).tooltip.enabled).toBe(false);
        expect((chart.series[0] as BarSeries).tooltip.renderer).toBe(tooltipRenderer);
    });
});

describe("polar overrides", () => {
    const tooltipRenderer = () => 'testing';
    const theme: AgChartTheme = {
        baseTheme: 'ag-default',
        palette: {
            fills: ['red', 'green', 'blue'],
            strokes: ['cyan']
        },
        overrides: {
            polar: {
                title: {
                    fontSize: 24,
                    fontWeight: 'bold'
                },
                background: {
                    fill: 'red'
                },
                series: {
                    pie: {
                        label: {
                            enabled: true,
                            color: 'yellow',
                            fontSize: 20
                        },
                        tooltip: {
                            enabled: false,
                            renderer: tooltipRenderer
                        }
                    }
                }
            }
        }
    };
    const options: AgPolarChartOptions = {
        theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data: [
            { label: 'Android', value: 56.9, other: 7 },
            { label: 'iOS', value: 22.5, other: 8 },
            { label: 'BlackBerry', value: 6.8, other: 9 },
            { label: 'Symbian', value: 8.5, other: 10 },
            { label: 'Bada', value: 2.6, other: 11 },
            { label: 'Windows', value: 1.9, other: 12 }
        ],
        series: [{
            type: 'pie',
            angleKey: 'value',
            labelKey: 'label',
            label: {
                fontSize: 18
            }
        }]
    };

    const chart = AgChart.create(options);

    test("Chart intstance properties", () => {
        expect(chart.title && chart.title.enabled).toBe(true);
        expect(chart.title && chart.title.fontSize).toBe(24);
        expect(chart.title && chart.title.fontWeight).toBe('normal');

        expect(chart.background.fill).toBe('red');

        expect(chart.series[0].type).toBe('pie');
        expect((chart.series[0] as PieSeries).fills).toEqual(['red', 'green', 'blue']);
        expect((chart.series[0] as PieSeries).strokes).toEqual(['cyan']);
        expect((chart.series[0] as PieSeries).label.enabled).toBe(true);
        expect((chart.series[0] as PieSeries).label.color).toBe('yellow');
        expect((chart.series[0] as PieSeries).label.fontSize).toBe(18);
        expect((chart.series[0] as PieSeries).tooltip.enabled).toBe(false);
        expect((chart.series[0] as PieSeries).tooltip.renderer).toBe(tooltipRenderer);
    });
});