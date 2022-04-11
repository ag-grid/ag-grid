var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { AgChart, ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
var LineChartProxy = /** @class */ (function (_super) {
    __extends(LineChartProxy, _super);
    function LineChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    LineChartProxy.prototype.createChart = function () {
        return AgChart.create({
            type: 'line',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    };
    LineChartProxy.prototype.update = function (params) {
        var _this = this;
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        this.updateAxes(params);
        var chart = this.chart;
        var fields = params.fields;
        var fieldIds = fields.map(function (f) { return f.colId; });
        var data = this.transformData(params.data, params.category.id);
        var existingSeriesById = chart.series.reduceRight(function (map, series, i) {
            var id = series.yKey;
            (fieldIds.indexOf(id) === i) ? map.set(id, series) : chart.removeSeries(series);
            return map;
        }, new Map());
        var previousSeries;
        var _a = this.chartTheme.palette, fills = _a.fills, strokes = _a.strokes;
        fields.forEach(function (f, index) {
            var _a = _this.processDataForCrossFiltering(data, f.colId, params), yKey = _a.yKey, atLeastOneSelectedPoint = _a.atLeastOneSelectedPoint;
            var lineSeries = existingSeriesById.get(f.colId);
            var fill = fills[index % fills.length];
            var stroke = strokes[index % strokes.length];
            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = data;
                lineSeries.xKey = params.category.id;
                lineSeries.xName = params.category.name;
                lineSeries.yKey = yKey;
                lineSeries.yName = f.displayName;
                lineSeries.marker.fill = fill;
                lineSeries.marker.stroke = stroke;
                lineSeries.stroke = fill; // this is deliberate, so that the line colours match the fills of other series
            }
            else {
                var seriesOverrides = _this.chartOptions[_this.standaloneChartType].series;
                var seriesOptions = __assign(__assign({}, seriesOverrides), { type: 'line', title: f.displayName, data: data, xKey: params.category.id, xName: params.category.name, yKey: yKey, yName: f.displayName, stroke: fill, marker: __assign(__assign({}, seriesOverrides.marker), { fill: fill,
                        stroke: stroke }) });
                lineSeries = AgChart.createComponent(seriesOptions, 'line.series');
                chart.addSeriesAfter(lineSeries, previousSeries);
            }
            _this.updateSeriesForCrossFiltering(lineSeries, f.colId, chart, params, atLeastOneSelectedPoint);
            previousSeries = lineSeries;
        });
        this.updateLabelRotation(params.category.id);
    };
    LineChartProxy.prototype.getAxes = function () {
        var axisOptions = this.getAxesOptions();
        return [
            __assign(__assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            __assign(__assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    };
    return LineChartProxy;
}(CartesianChartProxy));
export { LineChartProxy };
//# sourceMappingURL=lineChartProxy.js.map