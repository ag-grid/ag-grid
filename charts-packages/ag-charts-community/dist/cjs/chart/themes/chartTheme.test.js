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
//# sourceMappingURL=chartTheme.test.js.map