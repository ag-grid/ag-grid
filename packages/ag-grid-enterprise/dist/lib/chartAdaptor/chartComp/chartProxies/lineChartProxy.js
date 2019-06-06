// ag-grid-enterprise v21.0.1
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
var chartBuilder_1 = require("../../builder/chartBuilder");
var chartProxy_1 = require("./chartProxy");
var chartModel_1 = require("../chartModel");
var LineChartProxy = /** @class */ (function (_super) {
    __extends(LineChartProxy, _super);
    function LineChartProxy(params) {
        var _this = _super.call(this, params) || this;
        var defaultOpts = _this.defaultOptions();
        _this.chartOptions = _this.getChartOptions('line', _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createLineChart(_this.chartOptions);
        return _this;
    }
    LineChartProxy.prototype.update = function (params) {
        var _this = this;
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
        lineChart.series
            .map(function (series) { return series; })
            .forEach(updateSeries);
        var chart = this.chart;
        if (params.categoryId === chartModel_1.ChartModel.DEFAULT_CATEGORY) {
            chart.xAxis.labelRotation = 0;
        }
        else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation;
        }
        params.fields.forEach(function (f, index) {
            var seriesOptions = _this.chartOptions.seriesDefaults;
            var existingSeries = existingSeriesMap[f.colId];
            var lineSeries = existingSeries ? existingSeries : chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.categoryId;
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
    };
    LineChartProxy.prototype.defaultOptions = function () {
        var palette = this.chartProxyParams.getSelectedPalette();
        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            xAxis: {
                type: 'category',
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 45,
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
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
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
            legend: {
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
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
}(chartProxy_1.ChartProxy));
exports.LineChartProxy = LineChartProxy;
