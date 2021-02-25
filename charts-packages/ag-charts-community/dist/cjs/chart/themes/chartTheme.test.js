"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var agChart_1 = require("../agChart");
var chartTheme_1 = require("./chartTheme");
var data = [
    { label: 'Android', v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
    { label: 'iOS', v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
    { label: 'BlackBerry', v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
    { label: 'Symbian', v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
    { label: 'Windows', v1: 2.80, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.80 },
];
describe("getConfig", function () {
    test("chart tooltip", function () {
        var theme = new chartTheme_1.ChartTheme();
        expect(theme.getConfig('cartesian.tooltip.enabled')).toBe(true);
        expect(theme.getConfig('column.tooltip.enabled')).toBe(true);
        expect(theme.getConfig('cartesian.tooltip.delay')).toBe(0);
        expect(theme.getConfig('column.tooltip.delay')).toBe(0);
    });
    test("series tooltip", function () {
        var theme = new chartTheme_1.ChartTheme();
        expect(theme.getConfig('cartesian.series.column.tooltip.enabled')).toBe(true);
        expect(theme.getConfig('column.series.column.tooltip.enabled')).toBe(true);
    });
});
describe("cartesian overrides", function () {
    var tooltipRenderer = function () { return 'testing'; };
    var markerFormatter = function () {
        return {};
    };
    var theme = {
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
    var cartesianChartOptions = {
        theme: theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data: data,
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
    var serializedOptions = JSON.stringify(cartesianChartOptions);
    var chart = agChart_1.AgChart.create(cartesianChartOptions);
    test("Options are not mutated after AgChart.create", function () {
        expect(JSON.stringify(cartesianChartOptions)).toBe(serializedOptions);
    });
    test("Cartesian chart instance properties", function () {
        expect(chart.title && chart.title.enabled).toBe(true);
        expect(chart.title && chart.title.fontSize).toBe(24);
        expect(chart.title && chart.title.fontWeight).toBe('normal');
        expect(chart.background.fill).toBe('red');
        expect(chart.series[0].type).toBe('bar');
        expect(chart.series[0].fills).toEqual(['red', 'green', 'blue', 'red', 'green']);
        expect(chart.series[0].strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
        expect(chart.series[0].label.enabled).toBe(true);
        expect(chart.series[0].label.color).toBe('yellow');
        expect(chart.series[0].label.fontSize).toBe(18);
        expect(chart.series[0].tooltip.enabled).toBe(false);
        expect(chart.series[0].tooltip.renderer).toBe(tooltipRenderer);
        expect(chart.series[1].type).toBe('area');
        expect(chart.series[1].fills).toEqual(['blue', 'red', 'green', 'blue', 'red']);
        expect(chart.series[1].strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
        expect(chart.series[1].marker.formatter).toBe(markerFormatter);
    });
});
describe("polar overrides", function () {
    var tooltipRenderer = function () { return 'testing'; };
    var theme = {
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
    var polarChartOptions = {
        theme: theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data: data,
        series: [{
                type: 'pie',
                angleKey: 'v1',
                labelKey: 'label',
                label: {
                    fontSize: 18
                }
            }]
    };
    var serializedOptions = JSON.stringify(polarChartOptions);
    var chart = agChart_1.AgChart.create(polarChartOptions);
    test("Options are not mutated after AgChart.create", function () {
        expect(JSON.stringify(polarChartOptions)).toBe(serializedOptions);
    });
    test("Polar chart intstance properties", function () {
        expect(chart.title && chart.title.enabled).toBe(true);
        expect(chart.title && chart.title.fontSize).toBe(24);
        expect(chart.title && chart.title.fontWeight).toBe('normal');
        expect(chart.background.fill).toBe('red');
        expect(chart.series[0].type).toBe('pie');
        expect(chart.series[0].fills).toEqual(['red', 'green', 'blue']);
        expect(chart.series[0].strokes).toEqual(['cyan']);
        expect(chart.series[0].label.enabled).toBe(true);
        expect(chart.series[0].label.color).toBe('yellow');
        expect(chart.series[0].label.fontSize).toBe(18);
        expect(chart.series[0].tooltip.enabled).toBe(false);
        expect(chart.series[0].tooltip.renderer).toBe(tooltipRenderer);
    });
});
describe("common overrides", function () {
    var columnTooltipRenderer = function () { return 'testing'; };
    var pieTooltipRenderer = function () { return 'testing'; };
    var theme = {
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
    var cartesianChartOptions = {
        theme: theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data: data,
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
    var polarChartOptions = {
        theme: theme,
        title: {
            enabled: true,
            text: 'Test Chart',
            fontWeight: 'normal'
        },
        data: data,
        series: [{
                type: 'pie',
                angleKey: 'v1',
                labelKey: 'label',
                label: {
                    fontSize: 18
                }
            }]
    };
    var cartesianChart = agChart_1.AgChart.create(cartesianChartOptions);
    var polarChart = agChart_1.AgChart.create(polarChartOptions);
    test("Cartesian chart instance properties", function () {
        expect(cartesianChart.title && cartesianChart.title.enabled).toBe(true);
        expect(cartesianChart.title && cartesianChart.title.fontSize).toBe(24);
        expect(cartesianChart.title && cartesianChart.title.fontWeight).toBe('normal');
        expect(cartesianChart.background.fill).toBe('red');
        expect(cartesianChart.series[0].type).toBe('bar');
        expect(cartesianChart.series[0].fills).toEqual(['red', 'green', 'blue', 'red', 'green']);
        expect(cartesianChart.series[0].strokes).toEqual(['cyan', 'cyan', 'cyan', 'cyan', 'cyan']);
        expect(cartesianChart.series[0].label.enabled).toBe(true);
        expect(cartesianChart.series[0].label.color).toBe('blue');
        expect(cartesianChart.series[0].label.fontSize).toBe(18);
        expect(cartesianChart.series[0].tooltip.enabled).toBe(false);
        expect(cartesianChart.series[0].tooltip.renderer).toBe(columnTooltipRenderer);
    });
    test("Polar chart intstance properties", function () {
        expect(polarChart.title && polarChart.title.enabled).toBe(true);
        expect(polarChart.title && polarChart.title.fontSize).toBe(24);
        expect(polarChart.title && polarChart.title.fontWeight).toBe('normal');
        expect(polarChart.background.fill).toBe('red');
        expect(polarChart.series[0].type).toBe('pie');
        expect(polarChart.series[0].fills).toEqual(['red', 'green', 'blue']);
        expect(polarChart.series[0].strokes).toEqual(['cyan']);
        expect(polarChart.series[0].label.enabled).toBe(true);
        expect(polarChart.series[0].label.color).toBe('yellow');
        expect(polarChart.series[0].label.fontSize).toBe(18);
        expect(polarChart.series[0].tooltip.enabled).toBe(false);
        expect(polarChart.series[0].tooltip.renderer).toBe(pieTooltipRenderer);
    });
});
describe('Position specific axis styling', function () {
    var theme = {
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
                        top: {},
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
                        top: {},
                        right: {
                            line: {
                                color: 'blue',
                            },
                            label: {
                                fontSize: 18
                            }
                        },
                        bottom: {},
                        left: {}
                    }
                }
            }
        }
    };
    var defaultTheme = new chartTheme_1.ChartTheme();
    test('Themed bottom category, unthemed left number', function () {
        var chart = agChart_1.AgChart.create({
            theme: theme,
            data: data,
            series: [{
                    type: 'area',
                    xKey: 'label',
                    yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
                }]
        });
        expect(chart.axes[0].type).toBe('number');
        expect(chart.axes[0].position).toBe('left');
        expect(chart.axes[0].line.color).toBe(defaultTheme.getConfig('cartesian.axes.number.line.color'));
        expect(chart.axes[0].label.fontSize).toBe(defaultTheme.getConfig('cartesian.axes.number.label.fontSize'));
        expect(chart.axes[1].type).toBe('category');
        expect(chart.axes[1].position).toBe('bottom');
        expect(chart.axes[1].line.color).toBe('blue');
        expect(chart.axes[1].label.fontSize).toBe(18);
    });
    test('Specialized chart type themed bottom category, unthemed left number', function () {
        var chart = agChart_1.AgChart.create({
            type: 'area',
            theme: theme,
            data: data,
            series: [{
                    xKey: 'label',
                    yKeys: ['v1', 'v2', 'v3', 'v4', 'v5']
                }]
        });
        expect(chart.axes[0].type).toBe('number');
        expect(chart.axes[0].position).toBe('left');
        expect(chart.axes[0].line.color).toBe(defaultTheme.getConfig('cartesian.axes.number.line.color'));
        expect(chart.axes[0].label.fontSize).toBe(defaultTheme.getConfig('cartesian.axes.number.label.fontSize'));
        expect(chart.axes[1].type).toBe('category');
        expect(chart.axes[1].position).toBe('bottom');
        expect(chart.axes[1].line.color).toBe('blue');
        expect(chart.axes[1].label.fontSize).toBe(18);
    });
    test('Themed right number, unthemed top category', function () {
        var chart = agChart_1.AgChart.create({
            theme: theme,
            data: data,
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
        });
        expect(chart.axes[0].type).toBe('number');
        expect(chart.axes[0].position).toBe('right');
        expect(chart.axes[0].line.color).toBe('blue');
        expect(chart.axes[0].label.fontSize).toBe(18);
        expect(chart.axes[1].type).toBe('category');
        expect(chart.axes[1].position).toBe('top');
        expect(chart.axes[1].line.color).toBe('red');
        expect(chart.axes[1].label.fontSize).toBe(12);
    });
    test('Partially themed axes', function () {
        var chart = agChart_1.AgChart.create({
            theme: theme,
            data: data,
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
        });
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
        expect(chart.axes[1].title && chart.axes[1].title.enabled).toBe(false);
    });
});
//# sourceMappingURL=chartTheme.test.js.map