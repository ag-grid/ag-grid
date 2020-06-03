import { ChartBuilder } from "./chartBuilder";
import { CategoryAxis } from "./chart/axis/categoryAxis";
import { GroupedCategoryAxis } from "./chart/axis/groupedCategoryAxis";
import { NumberAxis } from "./chart/axis/numberAxis";
import { TimeAxis } from "./chart/axis/timeAxis";
import { LineSeries } from "./chart/series/cartesian/lineSeries";
import { ScatterSeries } from "./chart/series/cartesian/scatterSeries";
import { AreaSeries } from "./chart/series/cartesian/areaSeries";
import { PieSeries } from "./chart/series/polar/pieSeries";
import { BarSeries } from "./chart/series/cartesian/barSeries";
import 'jest-canvas-mock';
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
describe('toAxisClass', function () {
    it('returns category axis when "category" is specified', function () {
        var axisClass = ChartBuilder.toAxisClass('category');
        expect(axisClass).toBe(CategoryAxis);
    });
    it('returns number axis when "number" is specified', function () {
        var axisClass = ChartBuilder.toAxisClass('number');
        expect(axisClass).toBe(NumberAxis);
    });
    it('returns time axis when "time" is specified', function () {
        var axisClass = ChartBuilder.toAxisClass('time');
        expect(axisClass).toBe(TimeAxis);
    });
    it('returns undefined when unrecognised type is specified', function () {
        var axisClass = ChartBuilder.toAxisClass('foo');
        expect(axisClass).toBeUndefined();
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
        expect(series).toBeInstanceOf(BarSeries);
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
            legend: {},
            navigator: {}
        };
        var chart = ChartBuilder.createBarChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(CategoryAxis);
    });
});
describe('createColumnChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {},
            navigator: {}
        };
        var chart = ChartBuilder.createColumnChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});
describe('createLineChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {},
            navigator: {}
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
            legend: {},
            navigator: {}
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
            legend: {},
            navigator: {}
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
            legend: {},
            navigator: {}
        };
        var chart = ChartBuilder.createGroupedColumnChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});
describe('createGroupedBarChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {},
            navigator: {}
        };
        var chart = ChartBuilder.createGroupedBarChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(GroupedCategoryAxis);
    });
});
describe('createGroupedLineChart', function () {
    it('returns sensible axes by default', function () {
        var options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {},
            navigator: {}
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
            legend: {},
            navigator: {}
        };
        var chart = ChartBuilder.createGroupedAreaChart(null, options);
        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});
