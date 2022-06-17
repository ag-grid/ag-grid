import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
import { AgCartesianChartOptions, AgCartesianSeriesMarkerFormatter, AgChartTheme, AgPolarChartOptions } from "../agChartOptions";
import { AreaSeries } from "../series/cartesian/areaSeries";
import { BarSeries } from "../series/cartesian/barSeries";
import { PieSeries } from "../series/polar/pieSeries";
import { ChartTheme } from "./chartTheme";
import { AgChartV2 } from "../agChartV2";
import { CartesianChart } from "../cartesianChart";
import { PolarChart } from "../polarChart";
import { LineSeries } from "../series/cartesian/lineSeries";

const data = [
    { label: 'Android', v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
    { label: 'iOS', v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
    { label: 'BlackBerry', v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
    { label: 'Symbian', v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
    { label: 'Windows', v1: 2.80, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.80 },
];

describe('ChartTheme', () => {
    describe("getConfig", () => {
        test("chart tooltip", () => {
            const theme = new ChartTheme();
            expect(theme.getConfig('cartesian.tooltip.enabled')).toBe(true);
            expect(theme.getConfig('column.tooltip.enabled')).toBe(true);

            expect(theme.getConfig('cartesian.tooltip.delay')).toBe(0);
            expect(theme.getConfig('column.tooltip.delay')).toBe(0);
        });
        test("series tooltip", () => {
            const theme = new ChartTheme();
            expect(theme.getConfig('cartesian.series.column.tooltip.enabled')).toBe(true);
            expect(theme.getConfig('column.series.column.tooltip.enabled')).toBe(true);
        });
    });

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
        let chart: CartesianChart;
        
        beforeEach(() => chart = AgChartV2.create(cartesianChartOptions));
        afterEach(() => chart = null);

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
            expect((chart.series[1] as unknown as AreaSeries).fills).toEqual(['blue', 'red', 'green', 'blue', 'red']);
            expect((chart.series[1] as unknown as AreaSeries).strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
            expect((chart.series[1] as unknown as AreaSeries).marker.formatter).toBe(markerFormatter);
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
        let chart: PolarChart;
        
        beforeEach(() => chart = AgChartV2.create(polarChartOptions));
        afterEach(() => chart = null);

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
            expect((chart.series[0] as PieSeries).strokes).toEqual(['cyan', 'cyan', 'cyan']);
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

        const cartesianChart = AgChartV2.create(cartesianChartOptions);
        const polarChart = AgChartV2.create(polarChartOptions);

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
            expect((polarChart.series[0] as PieSeries).strokes).toEqual(['cyan', 'cyan', 'cyan']);
            expect((polarChart.series[0] as PieSeries).label.enabled).toBe(true);
            expect((polarChart.series[0] as PieSeries).label.color).toBe('yellow');
            expect((polarChart.series[0] as PieSeries).label.fontSize).toBe(18);
            expect((polarChart.series[0] as PieSeries).tooltip.enabled).toBe(false);
            expect((polarChart.series[0] as PieSeries).tooltip.renderer).toBe(pieTooltipRenderer);
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
                                fontSize: 12
                            },

                            top: {
                            },
                            right: {
                                line: {
                                    color: 'green',
                                },
                                label: {
                                    fontSize: 14
                                }
                            },
                            bottom: {
                                line: {
                                    color: 'blue',
                                },
                                label: {
                                    fontSize: 18
                                }
                            },
                            left: {
                                line: {
                                    color: 'gold',
                                },
                                label: {
                                    fontSize: 20
                                }
                            }
                        },
                        number: {
                            top: {

                            },
                            right: {
                                line: {
                                    color: 'blue',
                                },
                                label: {
                                    fontSize: 18
                                }
                            },
                            bottom: {

                            },
                            left: {

                            }
                        }
                    }
                }
            }
        };

        let defaultTheme: ChartTheme;
        beforeEach(() => {
            defaultTheme = new ChartTheme();
        });
        afterEach(() => {
            defaultTheme = null;
        });

        test('Themed bottom category, unthemed left number', () => {
            const chart = AgChartV2.create({
                theme,
                data,
                series: [{
                    type: 'area',
                    xKey: 'label',
                    yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
                }]
            } as AgCartesianChartOptions);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('left');
            expect(chart.axes[0].line.color).toBe(defaultTheme.getConfig('cartesian.axes.number.line.color'));
            expect(chart.axes[0].label.fontSize).toBe(defaultTheme.getConfig('cartesian.axes.number.label.fontSize'));

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('bottom');
            expect(chart.axes[1].line.color).toBe('blue');
            expect(chart.axes[1].label.fontSize).toBe(18);
        });

        test('Specialized chart type themed bottom category, unthemed left number', () => {
            const chart = AgChartV2.create({
                type: 'area',
                theme,
                data,
                series: [{
                    xKey: 'label',
                    yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
                }]
            } as AgCartesianChartOptions);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('left');
            expect(chart.axes[0].line.color).toBe(defaultTheme.getConfig('cartesian.axes.number.line.color'));
            expect(chart.axes[0].label.fontSize).toBe(defaultTheme.getConfig('cartesian.axes.number.label.fontSize'));

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('bottom');
            expect(chart.axes[1].line.color).toBe('blue');
            expect(chart.axes[1].label.fontSize).toBe(18);
        });

        test('Themed right number, unthemed top category', () => {
            const chart = AgChartV2.create({
                theme,
                data,
                axes: [{
                    type: 'number',
                    position: 'right'
                }, {
                    type: 'category',
                    position: 'top'
                }],
                series: [{
                    type: 'area',
                    xKey: 'label',
                    yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
                }]
            } as AgCartesianChartOptions);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('right');
            expect(chart.axes[0].line.color).toBe('blue');
            expect(chart.axes[0].label.fontSize).toBe(18);

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('top');
            expect(chart.axes[1].line.color).toBe('red');
            expect(chart.axes[1].label.fontSize).toBe(12);
        });

        test('Partially themed axes', () => {
            const chart = AgChartV2.create({
                theme,
                data,
                axes: [{
                    type: 'number',
                    position: 'right',
                    line: {
                        color: 'red'
                    },
                    label: {
                        fontStyle: 'italic',
                        fontFamily: 'Tahoma'
                    }
                }, {
                    type: 'category',
                    position: 'bottom',
                    line: {
                        width: 5
                    },
                    label: {
                        fontWeight: 'bold',
                        rotation: 45
                    },
                    title: {
                        text: 'Test'
                    }
                }],
                series: [{
                    type: 'area',
                    xKey: 'label',
                    yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
                }]
            } as AgCartesianChartOptions);

            expect(chart.axes[0].type).toBe('number');
            expect(chart.axes[0].position).toBe('right');
            expect(chart.axes[0].line.color).toBe('red');
            expect(chart.axes[0].label.fontSize).toBe(18);
            expect(chart.axes[0].label.fontStyle).toBe('italic');
            expect(chart.axes[0].label.fontFamily).toBe('Tahoma');
            expect(chart.axes[0].label.fontWeight).toBe(defaultTheme.getConfig('cartesian.axes.number.label.fontWeight'));
            expect(chart.axes[0].label.padding).toBe(defaultTheme.getConfig('cartesian.axes.number.label.padding'));
            expect(chart.axes[0].label.rotation).toBe(defaultTheme.getConfig('cartesian.axes.number.label.rotation'));

            expect(chart.axes[1].type).toBe('category');
            expect(chart.axes[1].position).toBe('bottom');
            expect(chart.axes[1].line.color).toBe('blue');
            expect(chart.axes[1].line.width).toBe(5);
            expect(chart.axes[1].label.fontSize).toBe(18);
            expect(chart.axes[1].label.fontStyle).toBe(defaultTheme.getConfig('cartesian.axes.category.label.fontStyle'));
            expect(chart.axes[1].label.fontFamily).toBe(defaultTheme.getConfig('cartesian.axes.category.label.fontFamily'));
            expect(chart.axes[1].label.fontWeight).toBe('bold');
            expect(chart.axes[1].label.rotation).toBe(45);
            expect(chart.axes[1].title && chart.axes[1].title.text).toBe('Test');
            // Since config is provided, the `enabled` should be auto-set to `true`,
            // even though theme's default is `false`.
            expect(chart.axes[1].title && chart.axes[1].title.enabled).toBe(true);
        });
    });

    describe("series overrides", () => {
        const theme: AgChartTheme = {
            baseTheme: 'ag-default',
            palette: {
                fills: ['red', 'green', 'blue'],
                strokes: ['cyan']
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
                    }
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
            }
        };

        const cartesianChartOptions: AgCartesianChartOptions = {
            theme,
            data,
            series: [{
                type: 'column',
                xKey: 'label',
                yKeys: ['v1', 'v2'],
                yNames: ['Reliability', 'Ease of use'],
            }, {
                type: 'line',
                xKey: 'label',
                yKey: 'v3',
                yName: 'Performance',
            }, {
                type: 'area',
                xKey: 'label',
                yKey: 'v4',
                yName: 'Price',
            }]
        };

        test("Cartesian chart instance properties", () => {
            const cartesianChart = AgChartV2.create(cartesianChartOptions);
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
