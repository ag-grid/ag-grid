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
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.chartOptions = _this.getChartOptions('pie', _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createPolarChart(_this.chartOptions);
        return _this;
    }
    PieChartProxy.prototype.update = function (params) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        var pieChart = this.chart;
        var existingSeries = pieChart.series[0];
        var existingSeriesId = existingSeries && existingSeries.angleField;
        var pieSeriesId = params.fields[0].colId;
        var pieSeriesName = params.fields[0].displayName;
        var pieSeries = existingSeries;
        var calloutColors = undefined;
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);
            var seriesOptions = this.chartOptions.seriesDefaults;
            // Use `Object.create` to prevent mutating the original user config that is possibly reused.
            var title = (seriesOptions.title ? Object.create(seriesOptions.title) : {});
            title.text = pieSeriesName;
            seriesOptions.title = title;
            seriesOptions.angleField = pieSeriesId;
            calloutColors = seriesOptions.calloutColors;
            pieSeries = chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
        }
        pieSeries.labelField = params.categoryId;
        pieSeries.data = params.data;
        var palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();
        pieSeries.fills = palette.fills;
        pieSeries.strokes = palette.strokes;
        if (calloutColors) {
            pieSeries.calloutColors = calloutColors;
        }
        if (!existingSeries) {
            pieChart.addSeries(pieSeries);
        }
    };
    PieChartProxy.prototype.defaultOptions = function () {
        var palette = this.chartProxyParams.getSelectedPalette();
        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legend: {
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerLineWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills: palette.fills,
                strokes: palette.strokes,
                lineWidth: 1,
                calloutColors: palette.strokes,
                calloutWidth: 2,
                calloutLength: 10,
                calloutPadding: 3,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 20,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined,
                title: {
                    enabled: false,
                    font: 'bold 12px Verdana, sans-serif',
                    color: 'black'
                }
            }
        };
    };
    return PieChartProxy;
}(chartProxy_1.ChartProxy));
exports.PieChartProxy = PieChartProxy;
