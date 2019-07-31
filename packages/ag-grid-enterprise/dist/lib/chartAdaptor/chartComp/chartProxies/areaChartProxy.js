// ag-grid-enterprise v21.1.1
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
var ag_grid_community_1 = require("ag-grid-community");
var chartProxy_1 = require("./chartProxy");
var categoryAxis_1 = require("../../../charts/chart/axis/categoryAxis");
var chartModel_1 = require("../chartModel");
var AreaChartProxy = /** @class */ (function (_super) {
    __extends(AreaChartProxy, _super);
    function AreaChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.chartType = params.chartType;
        _this.chartOptions = _this.getChartOptions(params.chartType, _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createAreaChart(_this.chartOptions);
        _this.setAxisPadding(_this.chart);
        var areaSeries = chartBuilder_1.ChartBuilder.createSeries(_this.chartOptions.seriesDefaults);
        if (areaSeries) {
            _this.chart.addSeries(areaSeries);
        }
        return _this;
    }
    AreaChartProxy.prototype.setAxisPadding = function (chart) {
        var xAxis = chart.xAxis;
        if (xAxis instanceof categoryAxis_1.CategoryAxis) {
            xAxis.scale.paddingInner = 1;
            xAxis.scale.paddingOuter = 0;
        }
    };
    AreaChartProxy.prototype.update = function (params) {
        if (this.chartType === ag_grid_community_1.ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        }
        else {
            // stacked and normalized has a single series
            var areaSeries = this.chart.series[0];
            areaSeries.data = params.data;
            areaSeries.xField = params.categoryId;
            areaSeries.yFields = params.fields.map(function (f) { return f.colId; });
            areaSeries.yFieldNames = params.fields.map(function (f) { return f.displayName; });
            var palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();
            areaSeries.fills = palette.fills;
            areaSeries.strokes = palette.strokes;
        }
        // always set the label rotation of the default category to 0 degrees
        var chart = this.chart;
        if (params.categoryId === chartModel_1.ChartModel.DEFAULT_CATEGORY) {
            chart.xAxis.labelRotation = 0;
        }
        else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation;
        }
    };
    AreaChartProxy.prototype.updateAreaChart = function (params) {
        var _this = this;
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        var lineChart = this.chart;
        var fieldIds = params.fields.map(function (f) { return f.colId; });
        var existingSeriesMap = {};
        var updateSeries = function (areaSeries) {
            var id = areaSeries.yFields[0];
            var seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = areaSeries : lineChart.removeSeries(areaSeries);
        };
        lineChart.series.map(function (series) { return series; }).forEach(updateSeries);
        params.fields.forEach(function (f, index) {
            var seriesOptions = _this.chartOptions.seriesDefaults;
            var existingSeries = existingSeriesMap[f.colId];
            var areaSeries = existingSeries ? existingSeries : chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            if (areaSeries) {
                areaSeries.yFieldNames = [f.displayName];
                areaSeries.data = params.data;
                areaSeries.xField = params.categoryId;
                areaSeries.yFields = [f.colId];
                var palette = _this.overriddenPalette ? _this.overriddenPalette : _this.chartProxyParams.getSelectedPalette();
                var fills = palette.fills;
                areaSeries.fills = [fills[index % fills.length]];
                var strokes = palette.strokes;
                areaSeries.strokes = [strokes[index % strokes.length]];
                if (!existingSeries) {
                    lineChart.addSeries(areaSeries);
                }
            }
        });
    };
    AreaChartProxy.prototype.defaultOptions = function () {
        var palette = this.chartProxyParams.getSelectedPalette();
        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            xAxis: {
                type: 'category',
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
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
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
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
                enabled: true,
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            seriesDefaults: {
                type: 'area',
                fills: palette.fills,
                strokes: palette.strokes,
                fillOpacity: this.chartProxyParams.chartType === ag_grid_community_1.ChartType.Area ? 0.7 : 1,
                normalizedTo: this.chartProxyParams.chartType === ag_grid_community_1.ChartType.NormalizedArea ? 100 : undefined,
                strokeWidth: 3,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined
            }
        };
    };
    return AreaChartProxy;
}(chartProxy_1.ChartProxy));
exports.AreaChartProxy = AreaChartProxy;
