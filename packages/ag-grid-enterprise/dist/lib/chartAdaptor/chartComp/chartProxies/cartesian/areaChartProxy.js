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
var categoryAxis_1 = require("../../../../charts/chart/axis/categoryAxis");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var AreaChartProxy = /** @class */ (function (_super) {
    __extends(AreaChartProxy, _super);
    function AreaChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.chartType = params.chartType;
        _this.initChartOptions(params.chartType, _this.defaultOptions());
        if (params.grouping) {
            _this.chart = chartBuilder_1.ChartBuilder.createGroupedAreaChart(_this.chartOptions);
        }
        else {
            _this.chart = chartBuilder_1.ChartBuilder.createAreaChart(_this.chartOptions);
        }
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
        var chart = this.chart;
        if (this.chartType === ag_grid_community_1.ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        }
        else {
            // stacked and normalized has a single series
            var areaSeries = this.chart.series[0];
            areaSeries.data = params.data;
            areaSeries.xField = params.category.id;
            areaSeries.yFields = params.fields.map(function (f) { return f.colId; });
            areaSeries.yFieldNames = params.fields.map(function (f) { return f.displayName; });
            var palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();
            areaSeries.fills = palette.fills;
            areaSeries.strokes = palette.strokes;
        }
        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation;
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
                areaSeries.xField = params.category.id;
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
    AreaChartProxy.prototype.setSeriesProperty = function (property, value) {
        var series = this.getChart().series;
        series.forEach(function (s) { return s[property] = value; });
        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    AreaChartProxy.prototype.getSeriesProperty = function (property) {
        return this.chartOptions.seriesDefaults ? "" + this.chartOptions.seriesDefaults[property] : '';
    };
    AreaChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    };
    AreaChartProxy.prototype.getMarkersEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.marker : false;
    };
    AreaChartProxy.prototype.defaultOptions = function () {
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
                type: 'area',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 3,
                strokeOpacity: 1,
                fillOpacity: this.chartProxyParams.chartType === ag_grid_community_1.ChartType.Area ? 0.7 : 1,
                normalizedTo: this.chartProxyParams.chartType === ag_grid_community_1.ChartType.NormalizedArea ? 100 : undefined,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0,0,0,0.5)'
                }
            }
        };
    };
    return AreaChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.AreaChartProxy = AreaChartProxy;
