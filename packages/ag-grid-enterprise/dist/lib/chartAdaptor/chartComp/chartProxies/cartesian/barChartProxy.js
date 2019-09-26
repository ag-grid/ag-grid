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
var BarChartProxy = /** @class */ (function (_super) {
    __extends(BarChartProxy, _super);
    function BarChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions(params.chartType, _this.defaultOptions());
        if (params.grouping) {
            _this.chart = BarChartProxy.isBarChart(params.chartType) ?
                chartBuilder_1.ChartBuilder.createGroupedBarChart(_this.chartOptions) : chartBuilder_1.ChartBuilder.createGroupedColumnChart(_this.chartOptions);
        }
        else {
            _this.chart = BarChartProxy.isBarChart(params.chartType) ?
                chartBuilder_1.ChartBuilder.createBarChart(_this.chartOptions) : chartBuilder_1.ChartBuilder.createColumnChart(_this.chartOptions);
        }
        var barSeries = chartBuilder_1.ChartBuilder.createSeries(_this.chartOptions.seriesDefaults);
        if (barSeries) {
            _this.chart.addSeries(barSeries);
        }
        return _this;
    }
    BarChartProxy.prototype.update = function (params) {
        var chart = this.chart;
        var barSeries = chart.series[0];
        barSeries.data = params.data;
        barSeries.xField = params.category.id;
        barSeries.yFields = params.fields.map(function (f) { return f.colId; });
        barSeries.yFieldNames = params.fields.map(function (f) { return f.displayName; });
        if (BarChartProxy.isBarChart(this.chartProxyParams.chartType)) {
            chart.yAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.yAxis.labelRotation;
        }
        else {
            chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation;
        }
        var palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();
        barSeries.fills = palette.fills;
        barSeries.strokes = palette.strokes;
    };
    BarChartProxy.prototype.setSeriesProperty = function (property, value) {
        var series = this.getChart().series;
        series.forEach(function (s) { return s[property] = value; });
        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    BarChartProxy.prototype.getSeriesProperty = function (property) {
        return this.chartOptions.seriesDefaults ? "" + this.chartOptions.seriesDefaults[property] : '';
    };
    BarChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    };
    BarChartProxy.prototype.getLabelEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.labelEnabled : false;
    };
    BarChartProxy.isBarChart = function (type) {
        return type === ag_grid_community_1.ChartType.GroupedBar || type === ag_grid_community_1.ChartType.StackedBar || type === ag_grid_community_1.ChartType.NormalizedBar;
    };
    BarChartProxy.prototype.defaultOptions = function () {
        var palette = this.chartProxyParams.getSelectedPalette();
        var chartType = this.chartProxyParams.chartType;
        return {
            parent: this.chartProxyParams.parentElement,
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
                type: 'bar',
                fills: palette.fills,
                strokes: palette.strokes,
                grouped: chartType === ag_grid_community_1.ChartType.GroupedColumn || chartType === ag_grid_community_1.ChartType.GroupedBar,
                normalizedTo: (chartType === ag_grid_community_1.ChartType.NormalizedColumn || chartType === ag_grid_community_1.ChartType.NormalizedBar) ? 100 : undefined,
                strokeWidth: 1,
                tooltipEnabled: true,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0,0,0,0.5)'
                },
                strokeOpacity: 1,
                fillOpacity: 1
            }
        };
    };
    return BarChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.BarChartProxy = BarChartProxy;
