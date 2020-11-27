import { AgChart } from "../agChart";
import { AgCartesianChartOptions, AgCartesianSeriesMarkerFormatter, AgChartTheme, AgPolarChartOptions } from "../agChartOptions";
import { AreaSeries } from "../series/cartesian/areaSeries";
import { BarSeries } from "../series/cartesian/barSeries";
import { PieSeries } from "../series/polar/pieSeries";

const data = [
    { label: 'Android', v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
    { label: 'iOS', v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
    { label: 'BlackBerry', v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
    { label: 'Symbian', v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
    { label: 'Windows', v1: 2.80, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.80 }
];

describe("cartesian overrides", () => {
    const tooltipRenderer = () => 'testing';
    const markerFormatter: AgCartesianSeriesMarkerFormatter = () => {
        return {

        };
    };

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
                    },
                    area: {
                        marker: {
                            formatter: markerFormatter
                        }
                    }
                }
            }
        }
    };
    const cartesianChartOptions: AgCartesianChartOptions = {
        theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data,
        series: [{
            type: 'column',
            xKey: 'label',
            yKeys: ['v1', 'v2', 'v3', 'v4', 'v5'],
            yNames: ['Reliability', 'Ease of use', 'Performance', 'Price', 'Market share'],
            label: {
                fontSize: 18
            }
        }, {
            type: 'area',
            xKey: 'label',
            yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
        }]
    };

    const serializedOptions = JSON.stringify(cartesianChartOptions);
    const chart = AgChart.create(cartesianChartOptions);

    test("Options are not mutated after AgChart.create", () => {
        expect(JSON.stringify(cartesianChartOptions)).toBe(serializedOptions);
    });

    test("Cartesian chart instance properties", () => {
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

        expect(chart.series[1].type).toBe('area');
        expect((chart.series[1] as AreaSeries).fills).toEqual(['blue', 'red', 'green', 'blue', 'red']);
        expect((chart.series[1] as AreaSeries).strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
        expect((chart.series[1] as AreaSeries).marker.formatter).toBe(markerFormatter);
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
    const polarChartOptions: AgPolarChartOptions = {
        theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data,
        series: [{
            type: 'pie',
            angleKey: 'v1',
            labelKey: 'label',
            label: {
                fontSize: 18
            }
        }]
    };

    const serializedOptions = JSON.stringify(polarChartOptions);
    const chart = AgChart.create(polarChartOptions);

    test("Options are not mutated after AgChart.create", () => {
        expect(JSON.stringify(polarChartOptions)).toBe(serializedOptions);
    });

    test("Polar chart intstance properties", () => {
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

describe("common overrides", () => {
    const columnTooltipRenderer = () => 'testing';
    const pieTooltipRenderer = () => 'testing';

    const theme: AgChartTheme = {
        baseTheme: 'ag-default',
        palette: {
            fills: ['red', 'green', 'blue'],
            strokes: ['cyan']
        },
        overrides: {
            common: {
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
                            color: 'blue',
                            fontSize: 22
                        },
                        tooltip: {
                            enabled: false,
                            renderer: columnTooltipRenderer
                        }
                    },
                    pie: {
                        label: {
                            enabled: true,
                            color: 'yellow',
                            fontSize: 20
                        },
                        tooltip: {
                            enabled: false,
                            renderer: pieTooltipRenderer
                        }
                    }
                }
            }
        }
    };

    const cartesianChartOptions: AgCartesianChartOptions = {
        theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data,
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

    const polarChartOptions: AgPolarChartOptions = {
        theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data,
        series: [{
            type: 'pie',
            angleKey: 'v1',
            labelKey: 'label',
            label: {
                fontSize: 18
            }
        }]
    };

    const cartesianChart = AgChart.create(cartesianChartOptions);
    const polarChart = AgChart.create(polarChartOptions);

    test("Cartesian chart instance properties", () => {
        expect(cartesianChart.title && cartesianChart.title.enabled).toBe(true);
        expect(cartesianChart.title && cartesianChart.title.fontSize).toBe(24);
        expect(cartesianChart.title && cartesianChart.title.fontWeight).toBe('normal');

        expect(cartesianChart.background.fill).toBe('red');

        expect(cartesianChart.series[0].type).toBe('bar');
        expect((cartesianChart.series[0] as BarSeries).fills).toEqual(['red', 'green', 'blue', 'red', 'green']);
        expect((cartesianChart.series[0] as BarSeries).strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
        expect((cartesianChart.series[0] as BarSeries).label.enabled).toBe(true);
        expect((cartesianChart.series[0] as BarSeries).label.color).toBe('blue');
        expect((cartesianChart.series[0] as BarSeries).label.fontSize).toBe(18);
        expect((cartesianChart.series[0] as BarSeries).tooltip.enabled).toBe(false);
        expect((cartesianChart.series[0] as BarSeries).tooltip.renderer).toBe(columnTooltipRenderer);
    });

    test("Polar chart intstance properties", () => {
        expect(polarChart.title && polarChart.title.enabled).toBe(true);
        expect(polarChart.title && polarChart.title.fontSize).toBe(24);
        expect(polarChart.title && polarChart.title.fontWeight).toBe('normal');

        expect(polarChart.background.fill).toBe('red');

        expect(polarChart.series[0].type).toBe('pie');
        expect((polarChart.series[0] as PieSeries).fills).toEqual(['red', 'green', 'blue']);
        expect((polarChart.series[0] as PieSeries).strokes).toEqual(['cyan']);
        expect((polarChart.series[0] as PieSeries).label.enabled).toBe(true);
        expect((polarChart.series[0] as PieSeries).label.color).toBe('yellow');
        expect((polarChart.series[0] as PieSeries).label.fontSize).toBe(18);
        expect((polarChart.series[0] as PieSeries).tooltip.enabled).toBe(false);
        expect((polarChart.series[0] as PieSeries).tooltip.renderer).toBe(pieTooltipRenderer);
    });
});