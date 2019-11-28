import { ChartBuilder } from "./chartBuilder";
import { AxisOptions, SeriesOptions } from "./chartOptions";
import { CategoryAxis } from "./chart/axis/categoryAxis";
import { GroupedCategoryAxis } from "./chart/axis/groupedCategoryAxis";
import { NumberAxis } from "./chart/axis/numberAxis";
import { TimeAxis } from "./chart/axis/timeAxis";
import { AxisType } from "@ag-grid-community/core";
import { CartesianChartLayout } from "./chart/cartesianChart";
import { LineSeries } from "./chart/series/cartesian/lineSeries";
import { ScatterSeries } from "./chart/series/cartesian/scatterSeries";
import { AreaSeries } from "./chart/series/cartesian/areaSeries";
import { PieSeries } from "./chart/series/polar/pieSeries";
import { ColumnSeries } from "./chart/series/cartesian/columnSeries";

beforeEach(() => {
    const createElement = document.createElement.bind(document);

    document.createElement = (tagName: string) => {
        if (tagName === 'canvas') {
            return {
                style: {},
                getContext: () => ({
                    drawImage: () => ({}),
                    $save: () => ({}),
                    $setTransform: () => ({}),
                }),
                addEventListener: () => ({}),
            };
        }

        return createElement(tagName);
    };
});

describe('createAxis', () => {
    it('returns category axis when specified in options', () => {
        const options: AxisOptions = { type: 'category' };
        const axis = ChartBuilder.createAxis(options, 'number');

        expect(axis).toBeInstanceOf(CategoryAxis);
    });

    it('returns category axis when specified in default type', () => {
        const options: AxisOptions = {};
        const axis = ChartBuilder.createAxis(options, 'category');

        expect(axis).toBeInstanceOf(CategoryAxis);
    });

    it('returns number axis when specified in options', () => {
        const options: AxisOptions = { type: 'number' };
        const axis = ChartBuilder.createAxis(options, 'category');

        expect(axis).toBeInstanceOf(NumberAxis);
    });

    it('returns number axis when specified in default type', () => {
        const options: AxisOptions = {};
        const axis = ChartBuilder.createAxis(options, 'number');

        expect(axis).toBeInstanceOf(NumberAxis);
    });

    it('returns time axis when specified in options', () => {
        const options: AxisOptions = { type: 'time' };
        const axis = ChartBuilder.createAxis(options, 'category');

        expect(axis).toBeInstanceOf(TimeAxis);
    });

    it('returns time axis when specified in default type', () => {
        const options: AxisOptions = {};
        const axis = ChartBuilder.createAxis(options, 'time');

        expect(axis).toBeInstanceOf(TimeAxis);
    });

    it('throws exception if type is not valid', () => {
        expect(() => ChartBuilder.createAxis({}, 'foo' as any as AxisType)).toThrowError('Unknown axis type');
    });
});

describe('createSeries', () => {
    it('returns a line series when specified in options', () => {
        const options: SeriesOptions = { type: 'line' };

        const series = ChartBuilder.createSeries(options);

        expect(series).toBeInstanceOf(LineSeries);
    });

    it('returns a scatter series when specified in options', () => {
        const options: SeriesOptions = { type: 'scatter' };

        const series = ChartBuilder.createSeries(options);

        expect(series).toBeInstanceOf(ScatterSeries);
    });

    it('returns a column series when specified in options', () => {
        const options: SeriesOptions = { type: 'bar' };

        const series = ChartBuilder.createSeries(options);

        expect(series).toBeInstanceOf(ColumnSeries);
    });

    it('returns an area series when specified in options', () => {
        const options: SeriesOptions = { type: 'area' };

        const series = ChartBuilder.createSeries(options);

        expect(series).toBeInstanceOf(AreaSeries);
    });

    it('returns a pie series when specified in options', () => {
        const options: SeriesOptions = { type: 'pie' };

        const series = ChartBuilder.createSeries(options);

        expect(series).toBeInstanceOf(PieSeries);
    });
});

describe('createBarChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createBarChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(CategoryAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Horizontal);
    });
});

describe('createColumnChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createColumnChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Vertical);
    });
});

describe('createLineChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createLineChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});

describe('createScatterChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createScatterChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});

describe('createAreaChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createAreaChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(CategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});

describe('createGroupedColumnChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createGroupedColumnChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Vertical);
    });
});

describe('createGroupedBarChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createGroupedBarChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(NumberAxis);
        expect(chart.axes[1]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.layout).toBe(CartesianChartLayout.Horizontal);
    });
});

describe('createGroupedLineChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createGroupedLineChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});

describe('createGroupedAreaChart', () => {
    it('returns sensible axes by default', () => {
        const options = {
            xAxis: {},
            yAxis: {},
            title: {},
            subtitle: {},
            legend: {}
        };

        const chart = ChartBuilder.createGroupedAreaChart(null, options);

        expect(chart.axes[0]).toBeInstanceOf(GroupedCategoryAxis);
        expect(chart.axes[1]).toBeInstanceOf(NumberAxis);
    });
});