// ag-grid-enterprise v21.0.0
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
var DoughnutChartProxy = /** @class */ (function (_super) {
    __extends(DoughnutChartProxy, _super);
    function DoughnutChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.chartOptions = _this.getChartOptions('doughnut', _this.defaultOptions());
        _this.chart = chartBuilder_1.ChartBuilder.createDoughnutChart(_this.chartOptions);
        return _this;
    }
    DoughnutChartProxy.prototype.update = function (params) {
        var _this = this;
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        var doughnutChart = this.chart;
        var fieldIds = params.fields.map(function (f) { return f.colId; });
        var existingSeriesMap = {};
        doughnutChart.series.forEach(function (series) {
            var pieSeries = series;
            var id = pieSeries.angleField;
            fieldIds.indexOf(id) > -1 ? existingSeriesMap[id] = pieSeries : doughnutChart.removeSeries(pieSeries);
        });
        var offset = 0;
        params.fields.forEach(function (f, index) {
            var existingSeries = existingSeriesMap[f.colId];
            var seriesOptions = _this.chartOptions.seriesDefaults;
            seriesOptions.title = f.displayName;
            seriesOptions.angleField = f.colId;
            seriesOptions.showInLegend = index === 0;
            var pieSeries = existingSeries ? existingSeries : chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            pieSeries.labelField = params.categoryId;
            pieSeries.data = params.data;
            if (index === 0) {
                pieSeries.toggleSeriesItem = function (itemId, enabled) {
                    var chart = pieSeries.chart;
                    if (chart) {
                        chart.series.forEach(function (series) {
                            series.enabled[itemId] = enabled;
                        });
                    }
                    pieSeries.scheduleData();
                };
            }
            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;
            var palette = _this.overriddenPalette ? _this.overriddenPalette : _this.chartProxyParams.getSelectedPalette();
            pieSeries.fills = palette.fills;
            pieSeries.strokes = palette.strokes;
            if (!existingSeries) {
                doughnutChart.addSeries(pieSeries);
            }
        });
    };
    DoughnutChartProxy.prototype.defaultOptions = function () {
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
                title: '',
                titleEnabled: false,
                titleFont: 'bold 12px Verdana, sans-serif'
            }
        };
    };
    return DoughnutChartProxy;
}(chartProxy_1.ChartProxy));
exports.DoughnutChartProxy = DoughnutChartProxy;
