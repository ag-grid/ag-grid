import { ChartBuilder } from "./chartBuilder";
import { CategoryAxis } from "./chart/axis/categoryAxis";
import { GroupedCategoryAxis } from "./chart/axis/groupedCategoryAxis";
import { NumberAxis } from "./chart/axis/numberAxis";
import { TimeAxis } from "./chart/axis/timeAxis";
import { CartesianChartLayout } from "./chart/cartesianChart";
import { LineSeries } from "./chart/series/cartesian/lineSeries";
import { ScatterSeries } from "./chart/series/cartesian/scatterSeries";
import { AreaSeries } from "./chart/series/cartesian/areaSeries";
import { PieSeries } from "./chart/series/polar/pieSeries";
import { ColumnSeries } from "./chart/series/cartesian/columnSeries";
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
        var axis = ChartBuilder.createAxis(options, 'number');
        expect(axis).toBeInstanceOf(CategoryAxis);
    });
    it('returns category axis when specified in default type', function () {
        var options = {};
        var axis = ChartBuilder.createAxis(options, 'category');
        expect(axis).toBeInstanceOf(CategoryAxis);
    });
    it('returns number axis when specified in options', function () {
        var options = { type: 'number' };
        var axis = ChartBuilder.createAxis(options, 'category');
        expect(axis).toBeInstanceOf(NumberAxis);
    });
    it('returns number axis when specified in default type', function () {
        var options = {};
        var axis = ChartBuilder.createAxis(options, 'number');
        expect(axis).toBeInstanceOf(NumberAxis);
    });
    it('returns time axis when specified in options', function () {
        var options = { type: 'time' };
        var axis = ChartBuilder.createAxis(options, 'category');
        expect(axis).toBeInstanceOf(TimeAxis);
    });
    it('returns time axis when specified in default type', function () {
        var options = {};
        var axis = ChartBuilder.createAxis(options, 'time');
        expect(axis).toBeInstanceOf(TimeAxis);
    });
    it('throws exception if type is not valid', function () {
        expect(function () { return ChartBuilder.createAxis({}, 'foo'); }).toThrowError('Unknown axis type');
    });
});
describe('createSeries', function () {
    it('returns a line series when specified in options', function () {
        var options = { type: 'line' };
        var series = ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(LineSeries);
    });
    it('returns a scatter series when specified in options', function () {
        var options = { type: 'scatter' };
        var series = ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(ScatterSeries);
    });
    it('returns a column series when specified in options', function () {
        var options = { type: 'bar' };
        var series = ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(ColumnSeries);
    });
    it('returns an area series when specified in options', function () {
        var options = { type: 'area' };
        var series = ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(AreaSeries);
    });
    it('returns a pie series when specified in options', function () {
        var options = { type: 'pie' };
        var series = ChartBuilder.createSeries(options);
        expect(series).toBeInstanceOf(PieSeries);
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
        var chart = ChartBuilder.createBarChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(CategoryAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Horizontal);
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
        var chart = ChartBuilder.createColumnChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Vertical);
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
        var chart = ChartBuilder.createLineChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
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
        var chart = ChartBuilder.createScatterChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
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
        var chart = ChartBuilder.createAreaChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
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
        var chart = ChartBuilder.createGroupedColumnChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Vertical);
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
        var chart = ChartBuilder.createGroupedBarChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Horizontal);
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
        var chart = ChartBuilder.createGroupedLineChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
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
        var chart = ChartBuilder.createGroupedAreaChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});
