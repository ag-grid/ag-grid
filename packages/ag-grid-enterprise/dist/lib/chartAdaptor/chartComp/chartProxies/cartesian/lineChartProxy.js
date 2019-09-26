// ag-grid-enterprise v21.2.2
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var chartBuilder_1 = require("../../../builder/chartBuilder");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var LineChartProxy = /** @class */ (function (_super) {
    __extends(LineChartProxy, _super);
    function LineChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions(ag_grid_community_1.ChartType.Line, _this.defaultOptions());
        if (params.grouping) {
            _this.chart = chartBuilder_1.ChartBuilder.createGroupedLineChart(_this.chartOptions);
        }
        else {
            _this.chart = chartBuilder_1.ChartBuilder.createLineChart(_this.chartOptions);
        }
        return _this;
    }
    LineChartProxy.prototype.update = function (params) {
        var _this = this;
        var chart = this.chart;
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        var lineChart = this.chart;
        var fieldIds = params.fields.map(function (f) { return f.colId; });
        var existingSeriesMap = {};
        var updateSeries = function (lineSeries) {
            var id = lineSeries.yField;
            var seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
        };
        lineChart.series.map(function (series) { return series; }).forEach(updateSeries);
        params.fields.forEach(function (f, index) {
            var seriesOptions = _this.chartOptions.seriesDefaults;
            var existingSeries = existingSeriesMap[f.colId];
            var lineSeries = existingSeries ? existingSeries : chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.category.id;
                lineSeries.yField = f.colId;
                var palette = _this.overriddenPalette ? _this.overriddenPalette : _this.chartProxyParams.getSelectedPalette();
                var fills = palette.fills;
                lineSeries.fill = fills[index % fills.length];
                var strokes = palette.strokes;
                lineSeries.stroke = strokes[index % strokes.length];
                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });
        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation;
    };
    LineChartProxy.prototype.setSeriesProperty = function (property, value) {
        var series = this.getChart().series;
        series.forEach(function (s) { return s[property] = value; });
        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    LineChartProxy.prototype.getSeriesProperty = function (property) {
        return this.chartOptions.seriesDefaults ? "" + this.chartOptions.seriesDefaults[property] : '';
    };
    LineChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    };
    LineChartProxy.prototype.getMarkersEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.marker : false;
    };
    LineChartProxy.prototype.defaultOptions = function () {
        var palette = this.chartProxyParams.getSelectedPalette();
        return {
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            legendPosition: 'right',
            legendPadding: 20,
            legend: {
                enabled: true,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            xAxis: {
                type: 'category',
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 335,
                tickColor: 'rgba(195, 195, 195, 1)',
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                        stroke: this.getAxisGridColor(),
                        lineDash: [4, 2]
                    }]
            },
            yAxis: {
                type: 'number',
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
                tickColor: 'rgba(195, 195, 195, 1)',
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                        stroke: this.getAxisGridColor(),
                        lineDash: [4, 2]
                    }]
            },
            seriesDefaults: {
                type: 'line',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 3,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                title: ''
            }
        };
    };
    return LineChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.LineChartProxy = LineChartProxy;
