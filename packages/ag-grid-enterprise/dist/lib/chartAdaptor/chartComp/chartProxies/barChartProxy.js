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
var ag_grid_community_1 = require("ag-grid-community");
var chartProxy_1 = require("./chartProxy");
var chartModel_1 = require("../chartModel");
var BarChartProxy = /** @class */ (function (_super) {
    __extends(BarChartProxy, _super);
    function BarChartProxy(params) {
        var _this = _super.call(this, params) || this;
        var barChartType = params.chartType === ag_grid_community_1.ChartType.GroupedBar ? 'groupedBar' : 'stackedBar';
        _this.chartOptions = _this.getChartOptions(barChartType, _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createBarChart(_this.chartOptions);
        var barSeries = chartBuilder_1.ChartBuilder.createSeries(_this.chartOptions.seriesDefaults);
        if (barSeries) {
            _this.chart.addSeries(barSeries);
        }
        return _this;
    }
    BarChartProxy.prototype.update = function (params) {
        var barSeries = this.chart.series[0];
        barSeries.data = params.data;
        barSeries.xField = params.categoryId;
        barSeries.yFields = params.fields.map(function (f) { return f.colId; });
        barSeries.yFieldNames = params.fields.map(function (f) { return f.displayName; });
        var chart = this.chart;
        if (params.categoryId === chartModel_1.ChartModel.DEFAULT_CATEGORY) {
            chart.xAxis.labelRotation = 0;
        }
        else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation;
        }
        var palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();
        barSeries.fills = palette.fills;
        barSeries.strokes = palette.strokes;
    };
    BarChartProxy.prototype.defaultOptions = function () {
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
                type: 'bar',
                fills: palette.fills,
                strokes: palette.strokes,
                grouped: this.chartProxyParams.chartType === ag_grid_community_1.ChartType.GroupedBar,
                strokeWidth: 1,
                tooltipEnabled: true,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelPadding: { x: 10, y: 10 },
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined
            }
        };
    };
    return BarChartProxy;
}(chartProxy_1.ChartProxy));
exports.BarChartProxy = BarChartProxy;
