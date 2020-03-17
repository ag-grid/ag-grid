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
import { _, ChartType } from "@ag-grid-community/core";
import { ChartBuilder } from "ag-charts-community";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { isDate } from "../../typeChecker";
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.getMarkersEnabled = function () { return true; }; // markers are always enabled on scatter charts
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    ScatterChartProxy.prototype.createChart = function (options) {
        return ChartBuilder.createScatterChart(this.chartProxyParams.parentElement, options || this.chartOptions);
    };
    ScatterChartProxy.prototype.update = function (params) {
        if (params.fields.length < 2) {
            this.chart.removeAllSeries();
            return;
        }
        var fields = params.fields;
        var seriesDefaults = this.chartOptions.seriesDefaults;
        var seriesDefinitions = this.getSeriesDefinitions(fields, seriesDefaults.paired);
        var testDatum = params.data[0];
        var xValuesAreDates = seriesDefinitions.map(function (d) { return d.xField.colId; }).map(function (xKey) { return testDatum && testDatum[xKey]; }).every(function (test) { return isDate(test); });
        this.updateAxes(xValuesAreDates ? 'time' : 'number');
        var chart = this.chart;
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        var seriesOptions = __assign({ type: "scatter" }, seriesDefaults);
        var labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        var existingSeriesById = chart.series.reduceRight(function (map, series, i) {
            var matchingIndex = _.findIndex(seriesDefinitions, function (s) {
                return s.xField.colId === series.xKey &&
                    s.yField.colId === series.yKey &&
                    ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey));
            });
            if (matchingIndex === i) {
                map.set(series.yKey, series);
            }
            else {
                chart.removeSeries(series);
            }
            return map;
        }, new Map());
        var previousSeries = undefined;
        seriesDefinitions.forEach(function (seriesDefinition, index) {
            var existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
            var series = existingSeries || ChartBuilder.createSeries(seriesOptions);
            if (!series) {
                return;
            }
            var xFieldDefinition = seriesDefinition.xField, yFieldDefinition = seriesDefinition.yField, sizeFieldDefinition = seriesDefinition.sizeField;
            series.title = yFieldDefinition.displayName + " vs " + xFieldDefinition.displayName;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];
            if (sizeFieldDefinition) {
                series.sizeKey = sizeFieldDefinition.colId;
                series.sizeName = sizeFieldDefinition.displayName;
            }
            else {
                series.sizeKey = series.sizeName = undefined;
            }
            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            }
            else {
                series.labelKey = series.labelName = undefined;
            }
            if (!existingSeries) {
                chart.addSeriesAfter(series, previousSeries);
            }
            previousSeries = series;
        });
    };
    ScatterChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults.tooltip != null && !!this.chartOptions.seriesDefaults.tooltip.enabled;
    };
    ScatterChartProxy.prototype.getDefaultOptions = function () {
        var isBubble = this.chartType === ChartType.Bubble;
        var options = this.getDefaultCartesianChartOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { fill: __assign(__assign({}, options.seriesDefaults.fill), { opacity: isBubble ? 0.7 : 1 }), stroke: __assign(__assign({}, options.seriesDefaults.stroke), { width: 3 }), marker: {
                shape: 'circle',
                enabled: true,
                size: isBubble ? 30 : 6,
                minSize: isBubble ? 6 : undefined,
                strokeWidth: 1,
            }, tooltip: {
                enabled: true,
            }, paired: false });
        return options;
    };
    ScatterChartProxy.prototype.getSeriesDefinitions = function (fields, paired) {
        if (fields.length < 2) {
            return [];
        }
        var isBubbleChart = this.chartType === ChartType.Bubble;
        if (paired) {
            if (isBubbleChart) {
                return fields.map(function (xField, i) { return i % 3 === 0 ? ({
                    xField: xField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null; }).filter(function (x) { return x && x.yField && x.sizeField; });
            }
            else {
                return fields.map(function (xField, i) { return i % 2 === 0 ? ({
                    xField: xField,
                    yField: fields[i + 1],
                }) : null; }).filter(function (x) { return x && x.yField; });
            }
        }
        else {
            var xField_1 = fields[0];
            if (isBubbleChart) {
                return fields
                    .map(function (yField, i) { return i % 2 === 1 ? ({
                    xField: xField_1,
                    yField: yField,
                    sizeField: fields[i + 1],
                }) : null; })
                    .filter(function (x) { return x && x.sizeField; });
            }
            else {
                return fields.filter(function (_, i) { return i > 0; }).map(function (yField) { return ({ xField: xField_1, yField: yField }); });
            }
        }
    };
    return ScatterChartProxy;
}(CartesianChartProxy));
export { ScatterChartProxy };
