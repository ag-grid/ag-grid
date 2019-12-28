"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chartBuilder_1 = require("./chartBuilder");
var categoryAxis_1 = require("./chart/axis/categoryAxis");
var groupedCategoryAxis_1 = require("./chart/axis/groupedCategoryAxis");
var numberAxis_1 = require("./chart/axis/numberAxis");
var timeAxis_1 = require("./chart/axis/timeAxis");
var cartesianChart_1 = require("./chart/cartesianChart");
var lineSeries_1 = require("./chart/series/cartesian/lineSeries");
var scatterSeries_1 = require("./chart/series/cartesian/scatterSeries");
var areaSeries_1 = require("./chart/series/cartesian/areaSeries");
var pieSeries_1 = require("./chart/series/polar/pieSeries");
var columnSeries_1 = require("./chart/series/cartesian/columnSeries");
beforeEach(function () {
    var createElement = document.createElement.bind(document);
    document.createElement = function (tagName) {
        if (tagName === 'canvas') {
            return {
                style: {},
                getContext: function () { return ({
                    drawImage: function () { return ({}); },
                    $save: function () { return ({}); },
                    $setTransform: function () { return ({}); },
                }); },
                addEventListener: function () { return ({}); },
            };
        }
        return createElement(tagName);
    };
});
describe('createAxis', function () {
    it('returns category axis when specified in options', function () {
        var options = { type: 'category' };
        var axis = chartBuilder_1.ChartBuilder.createAxis(options, 'number');
        expect(axis).toBeInstanceOf(categoryAxis_1.CategoryAxis);
    });
    it('returns category axis when specified in default type', function () {
        var options = {};
        var axis = chartBuilder_1.ChartBuilder.createAxis(options, 'category');
        expect(axis).toBeInstanceOf(categoryAxis_1.CategoryAxis);
    });
    it('returns number axis when specified in options', function () {
        var options = { type: 'number' };
        var axis = chartBuilder_1.ChartBuilder.createAxis(options, 'category');
        expect(axis).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
    it('returns number axis when specified in default type', function () {
        var options = {};
        var axis = chartBuilder_1.ChartBuilder.createAxis(options, 'number');
        expect(axis).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
    it('returns time axis when specified in options', function () {
        var options = { type: 'time' };
        var axis = chartBuilder_1.ChartBuilder.createAxis(options, 'category');
        expect(axis).toBeInstanceOf(timeAxis_1.TimeAxis);
    });
    it('returns time axis when specified in default type', function () {
        var options = {};
        var axis = chartBuilder_1.ChartBuilder.createAxis(options, 'time');
        expect(axis).toBeInstanceOf(timeAxis_1.TimeAxis);
    });
    it('throws exception if type is not valid', function () {
        expect(function () { return chartBuilder_1.ChartBuilder.createAxis({}, 'foo'); }).toThrowError('Unknown axis type');
    });
});
describe('createSeries', function () {
    it('returns a line series when specified in options', function () {
        var options = { type: 'line' };
        var series = chartBuilder_1.ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(lineSeries_1.LineSeries);
    });
    it('returns a scatter series when specified in options', function () {
        var options = { type: 'scatter' };
        var series = chartBuilder_1.ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(scatterSeries_1.ScatterSeries);
    });
    it('returns a column series when specified in options', function () {
        var options = { type: 'bar' };
        var series = chartBuilder_1.ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(columnSeries_1.ColumnSeries);
    });
    it('returns an area series when specified in options', function () {
        var options = { type: 'area' };
        var series = chartBuilder_1.ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(areaSeries_1.AreaSeries);
    });
    it('returns a pie series when specified in options', function () {
        var options = { type: 'pie' };
        var series = chartBuilder_1.ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(pieSeries_1.PieSeries);
    });
});
describe('createBarChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createBarChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(numberAxis_1.NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(categoryAxis_1.CategoryAxis);
        expect(chart.layout).toBe(cartesianChart_1.CartesianChartLayout.Horizontal);
    });
});
describe('createColumnChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createColumnChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(categoryAxis_1.CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
        expect(chart.layout).toBe(cartesianChart_1.CartesianChartLayout.Vertical);
    });
});
describe('createLineChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createLineChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(categoryAxis_1.CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
});
describe('createScatterChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createScatterChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(numberAxis_1.NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
});
describe('createAreaChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createAreaChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(categoryAxis_1.CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
});
describe('createGroupedColumnChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createGroupedColumnChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(groupedCategoryAxis_1.GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
        expect(chart.layout).toBe(cartesianChart_1.CartesianChartLayout.Vertical);
    });
});
describe('createGroupedBarChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createGroupedBarChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(numberAxis_1.NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(groupedCategoryAxis_1.GroupedCategoryAxis);
        expect(chart.layout).toBe(cartesianChart_1.CartesianChartLayout.Horizontal);
    });
});
describe('createGroupedLineChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createGroupedLineChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(groupedCategoryAxis_1.GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
});
describe('createGroupedAreaChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };
        var chart = chartBuilder_1.ChartBuilder.createGroupedAreaChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(groupedCategoryAxis_1.GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(numberAxis_1.NumberAxis);
    });
});
//# sourceMappingURL=chartBuilder.test.js.map